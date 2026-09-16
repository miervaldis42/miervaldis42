// 🧪📦 Test Imports
import { expect, test } from "vitest";

// 🧠 Engine
import { analyze, selectRepositories } from "@/analyze.js";
import { loadConfig } from "@/load-config.js";

// 🧩 Fixtures
import { githubRepository } from "@tests/engine/fixtures/github.js";

// 🏷️ Types
import type { LoadedConfig } from "@customTypes/config.js";
import type { GitHubClient } from "@customTypes/github.js";

/*
 * 🧩 Fixtures
 */

function analysisConfig(): LoadedConfig {
  const config = loadConfig();

  return {
    ...config,
    repository: {
      owner: "owner",
      include: [],
      exclude: [],
    },
  };
}

/*
 * 🗂️ Repository Selection
 */

// Check that repository selection applies every configured eligibility rule
test("Repository Selection: Inclusion & Exclusion Rule Check", () => {
  const repositories = [
    githubRepository("public"),
    githubRepository("private", {
      private: true,
    }),
    githubRepository("fork", {
      fork: true,
    }),
    githubRepository("archived", {
      archived: true,
    }),
    githubRepository("owner"),
    githubRepository("excluded"),
    githubRepository("foreign", {
      owner: {
        login: "elsewhere",
      },
    }),
  ];

  const selection = selectRepositories(repositories, {
    owner: "OWNER",
    include: [],
    exclude: ["OWNER/excluded"],
  });

  expect(
    selection.map(({ full_name, reason }) => ({
      full_name,
      reason,
    })),
  ).toEqual([
    {
      full_name: "owner/public",
      reason: null,
    },
    {
      full_name: "owner/private",
      reason: null,
    },
    {
      full_name: "owner/fork",
      reason: "fork",
    },
    {
      full_name: "owner/archived",
      reason: "archived",
    },
    {
      full_name: "owner/owner",
      reason: "profile repository",
    },
    {
      full_name: "owner/excluded",
      reason: "explicit exclusion",
    },
    {
      full_name: "owner/foreign",
      reason: "other owner",
    },
  ]);
});

// Check that an inclusion list restricts eligible repositories without overriding stronger exclusions
test("Repository Selection: Explicit Inclusion List Check", () => {
  const repositories = [
    githubRepository("a"),
    githubRepository("b", {
      private: true,
    }),
    githubRepository("fork", {
      fork: true,
    }),
    githubRepository("excluded"),
  ];

  const selection = selectRepositories(repositories, {
    owner: "owner",
    include: ["OWNER/B", "owner/fork", "owner/excluded"],
    exclude: ["OWNER/excluded"],
  });

  expect(
    selection.map(({ full_name, reason }) => ({
      full_name,
      reason,
    })),
  ).toEqual([
    {
      full_name: "owner/a",
      reason: "outside inclusion list",
    },
    {
      full_name: "owner/b",
      reason: null,
    },
    {
      full_name: "owner/fork",
      reason: "fork",
    },
    {
      full_name: "owner/excluded",
      reason: "explicit exclusion",
    },
  ]);
});

/*
 * 🧠 Analysis Orchestration
 */

// Check that public & authorized private repositories are deduplicated, analyzed & aggregated
test("Analysis: Public & Authorized Private Repository Orchestration Check", () => {
  const calls: string[] = [];

  const publicRepository = githubRepository("public");

  const privateRepository = githubRepository("private", {
    private: true,
  });

  const api: GitHubClient = <T>(endpoint: string): T => {
    calls.push(endpoint);

    if (endpoint.startsWith("users/")) {
      return [[publicRepository]] as T;
    }

    if (endpoint.startsWith("user/repos")) {
      return [[publicRepository, privateRepository]] as T;
    }

    if (endpoint.endsWith("/languages")) {
      return {
        JavaScript: 100,
      } as T;
    }

    if (endpoint.includes("/git/trees/")) {
      return {
        sha: "root",
        truncated: false,
        tree: [
          {
            path: "package.json",
            sha: "manifest",
            type: "blob",
            mode: "100644",
            size: 50,
          },
        ],
      } as T;
    }

    if (endpoint.includes("/git/blobs/")) {
      return {
        encoding: "base64",
        size: 50,
        content: Buffer.from(
          JSON.stringify({
            dependencies: {
              react: "1",
            },
          }),
        ).toString("base64"),
      } as T;
    }

    throw new Error(`Unexpected GitHub API call: ${endpoint}`);
  };

  const report = analyze(api, analysisConfig());

  expect(report.includedRepositoryCount).toBe(2);

  expect(report.privateRepositoryNames).toEqual(["owner/private"]);

  expect(report.summary.metrics.react?.label).toBe("100.0%");

  expect(calls.filter((call) => call.endsWith("/languages"))).toHaveLength(2);
});

/*
 * 📥 Repository Evidence
 */

// ! Edge case: Evidence exceeds configured size bounds => reject partial statistics
test("Analysis: Edge Case - Oversized Evidence Rejection", () => {
  const config = analysisConfig();

  config.analysis = {
    ...config.analysis,
    maxEvidenceBytes: 10,
  };

  const repositoryUnderAnalysis = githubRepository("oversized");

  const api: GitHubClient = <T>(endpoint: string): T => {
    if (endpoint.startsWith("users/")) {
      return [[repositoryUnderAnalysis]] as T;
    }

    if (endpoint.startsWith("user/repos")) {
      return [[]] as T;
    }

    if (endpoint.endsWith("/languages")) {
      return {} as T;
    }

    if (endpoint.includes("/git/trees/")) {
      return {
        sha: "root",
        truncated: false,
        tree: [
          {
            path: "package.json",
            sha: "manifest",
            type: "blob",
            mode: "100644",
            size: 11,
          },
        ],
      } as T;
    }

    throw new Error(`Unexpected GitHub API call: ${endpoint}`);
  };

  expect(() => analyze(api, config)).toThrow(
    "🔊 Repository evidence exceeds configured bounds; refusing partial statistics.",
  );
});

// ! Edge case: Evidence blob is not supported => reject repository analysis
test("Analysis: Edge Case - Unsupported Evidence Blob Rejection", () => {
  const repositoryUnderAnalysis = githubRepository("unsupported");

  const api: GitHubClient = <T>(endpoint: string): T => {
    if (endpoint.startsWith("users/")) {
      return [[repositoryUnderAnalysis]] as T;
    }

    if (endpoint.startsWith("user/repos")) {
      return [[]] as T;
    }

    if (endpoint.endsWith("/languages")) {
      return {} as T;
    }

    if (endpoint.includes("/git/trees/")) {
      return {
        sha: "root",
        truncated: false,
        tree: [
          {
            path: "package.json",
            sha: "manifest",
            type: "blob",
            mode: "100644",
            size: 5,
          },
        ],
      } as T;
    }

    if (endpoint.includes("/git/blobs/")) {
      return {
        encoding: "utf8",
        size: 5,
        content: "hello",
      } as T;
    }

    throw new Error(`Unexpected GitHub API call: ${endpoint}`);
  };

  expect(() => analyze(api, analysisConfig())).toThrow(
    "🔊 Unsupported or oversized evidence blob.",
  );
});
