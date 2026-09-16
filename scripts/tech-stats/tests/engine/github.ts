// 🧪📦 Test Imports
import { expect, test } from "vitest";

// 🧠 Engine
import { githubClient, readRepoTree } from "@/github.js";

// 🧩 Fixtures
import { githubRepository } from "@tests/engine/fixtures/github.js";

// 🏷️ Types
import type { AnalysisSettings } from "@customTypes/config.js";
import type { GitHubClient, GitTreeResponse } from "@customTypes/github.js";

/*
 * 🧩 Fixtures
 */

const analysis: AnalysisSettings = {
  ignoredPathSegments: ["node_modules", ".git"],
  maxEvidenceFiles: 100,
  maxEvidenceBytes: 100_000,
};

const repository = githubRepository("repository");

function createTreeClient(
  responses: Array<GitTreeResponse | null>,
  calls: string[] = [],
): GitHubClient {
  return <T>(endpoint: string): T => {
    calls.push(endpoint);

    const response = responses.shift();

    if (response === undefined) {
      throw new Error("Unexpected GitHub API call.");
    }

    return response as T;
  };
}

/*
 * 🌳 Repository Tree
 */

// For a complete GitHub tree, check that only eligible checked-in files are returned
test("Git Tree: Eligible Repository File Filtering Check", () => {
  const api = createTreeClient([
    {
      sha: "root",
      truncated: false,
      tree: [
        {
          path: "src/index.ts",
          type: "blob",
          mode: "100644",
          sha: "source",
        },
        {
          path: "node_modules/package/index.js",
          type: "blob",
          mode: "100644",
          sha: "dependency",
        },
        {
          path: "linked-file",
          type: "blob",
          mode: "120000",
          sha: "symlink",
        },
        {
          path: "src",
          type: "tree",
          mode: "040000",
          sha: "directory",
        },
      ],
    },
  ]);

  const result = readRepoTree(api, repository, analysis);

  expect(result.map((entry) => entry.path)).toEqual(["src/index.ts"]);
});

// For a truncated recursive GitHub tree, check that nested files are recovered manually
test("Git Tree: Truncated Tree Recovery Check", () => {
  const calls: string[] = [];

  const api = createTreeClient(
    [
      {
        sha: "root",
        truncated: true,
        tree: [],
      },
      {
        sha: "root",
        truncated: false,
        tree: [
          {
            path: "apps",
            type: "tree",
            mode: "040000",
            sha: "apps",
          },
          {
            path: "node_modules",
            type: "tree",
            mode: "040000",
            sha: "dependencies",
          },
        ],
      },
      {
        sha: "apps",
        truncated: false,
        tree: [
          {
            path: "package.json",
            type: "blob",
            mode: "100644",
            sha: "manifest",
          },
        ],
      },
    ],
    calls,
  );

  const result = readRepoTree(api, repository, analysis);

  expect(result.map((entry) => entry.path)).toEqual(["apps/package.json"]);

  expect(calls).toHaveLength(3);
});

// ! Edge case: Empty repository => empty file list
test("Git Tree: Edge Case - Empty Repository", () => {
  const api = createTreeClient([null]);

  const result = readRepoTree(
    api,
    githubRepository("empty-repository", {
      size: 0,
    }),
    analysis,
  );

  expect(result).toEqual([]);
});

// ! Edge case: Manually recovered subtree still truncated => reject partial evidence
test("Git Tree: Edge Case - Persistently Truncated Tree Rejection", () => {
  const api = createTreeClient([
    {
      sha: "root",
      truncated: true,
      tree: [],
    },
    {
      sha: "root",
      truncated: true,
      tree: [],
    },
  ]);

  expect(() => readRepoTree(api, repository, analysis)).toThrow(
    "🔊 Git tree remains truncated; refusing partial statistics.",
  );
});

/*
 * 🔐 GitHub Authentication
 */

// ! Edge case: Local GitHub credentials requested inside GitHub Actions => error
test("GitHub Authentication: Edge Case - Local Credential Rejection in GitHub Actions", () => {
  const originalGitHubActions = process.env.GITHUB_ACTIONS;

  try {
    process.env.GITHUB_ACTIONS = "true";

    expect(() =>
      githubClient({
        localGh: true,
      }),
    ).toThrow("🔊 Local credential mode is unavailable in Actions.");
  } finally {
    if (originalGitHubActions === undefined) {
      delete process.env.GITHUB_ACTIONS;
    } else {
      process.env.GITHUB_ACTIONS = originalGitHubActions;
    }
  }
});

// ! Edge case: Automated analysis without `TECH_STATS_TOKEN` => error
test("GitHub Authentication: Edge Case - Missing Analysis Token Rejection", () => {
  const originalToken = process.env.TECH_STATS_TOKEN;

  try {
    delete process.env.TECH_STATS_TOKEN;

    expect(() => githubClient()).toThrow(
      "🔊 `TECH_STATS_TOKEN` is required for analysis.",
    );
  } finally {
    if (originalToken === undefined) {
      delete process.env.TECH_STATS_TOKEN;
    } else {
      process.env.TECH_STATS_TOKEN = originalToken;
    }
  }
});
