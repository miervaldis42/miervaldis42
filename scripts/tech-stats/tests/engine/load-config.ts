// 📦 Imports
import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";

// 🧪📦 Test Imports
import { afterEach, beforeEach, expect, test } from "vitest";

// 🎯 Assertions
import { expectEngineError } from "@tests/engine/helpers/assertions.js";

// ⚙️ Engine
import { loadConfig, loadLocalRepositoryEnvironment } from "@/load-config.js";
import { githubClient } from "@/github.js";

/*
 * 🧩 Test Environment
 */

let directory: string;

let originalActions: string | undefined;
let originalRepositories: string | undefined;
let originalToken: string | undefined;

function restoreEnvironment(name: string, value: string | undefined): void {
  if (value === undefined) {
    delete process.env[name];
  } else {
    process.env[name] = value;
  }
}

beforeEach(() => {
  originalActions = process.env.GITHUB_ACTIONS;
  originalRepositories = process.env.TECH_STATS_REPOSITORIES;
  originalToken = process.env.TECH_STATS_TOKEN;

  delete process.env.GITHUB_ACTIONS;
  delete process.env.TECH_STATS_REPOSITORIES;

  directory = mkdtempSync(path.join(tmpdir(), "tech-stats-env-"));
});

afterEach(() => {
  restoreEnvironment("GITHUB_ACTIONS", originalActions);
  restoreEnvironment("TECH_STATS_REPOSITORIES", originalRepositories);
  restoreEnvironment("TECH_STATS_TOKEN", originalToken);

  rmSync(directory, {
    recursive: true,
    force: true,
  });
});

/*
 * 🔐 Local Configuration
 */

test("Local Environment: Optional File", () => {
  loadLocalRepositoryEnvironment(path.join(directory, ".env"));

  expect(process.env.TECH_STATS_REPOSITORIES).toBeUndefined();
});

test("Local Environment: Repository Override Loading", () => {
  const override = '{"include":["username/private-repo"]}';

  writeFileSync(
    path.join(directory, ".env"),
    `TECH_STATS_REPOSITORIES='${override}'\n`,
  );

  loadLocalRepositoryEnvironment(path.join(directory, ".env"));

  expect(process.env.TECH_STATS_REPOSITORIES).toBe(override);
});

test("Local Environment: Process Variable Precedence", () => {
  process.env.TECH_STATS_REPOSITORIES = '{"include":["username/process-repo"]}';

  writeFileSync(
    path.join(directory, ".env"),
    "TECH_STATS_REPOSITORIES='{\"include\":[]}'\n",
  );

  loadLocalRepositoryEnvironment(path.join(directory, ".env"));

  expect(JSON.parse(process.env.TECH_STATS_REPOSITORIES)).toEqual({
    include: ["username/process-repo"],
  });
});

test("Local Environment: Unrelated Variables Ignored", () => {
  delete process.env.TECH_STATS_TOKEN;

  writeFileSync(
    path.join(directory, ".env"),
    [
      "TECH_STATS_TOKEN=unwanted-token",
      "TECH_STATS_REPOSITORIES='{\"include\":[]}'",
    ].join("\n"),
  );

  loadLocalRepositoryEnvironment(path.join(directory, ".env"));

  expect(process.env.TECH_STATS_TOKEN).toBeUndefined();
});

test("Local Environment: GitHub Actions Isolation", () => {
  process.env.GITHUB_ACTIONS = "true";

  writeFileSync(
    path.join(directory, ".env"),
    "TECH_STATS_REPOSITORIES='{\"include\":[]}'\n",
  );

  loadLocalRepositoryEnvironment(path.join(directory, ".env"));

  expect(process.env.TECH_STATS_REPOSITORIES).toBeUndefined();
});

test("Local Environment: Invalid Override Rejection", () => {
  process.env.TECH_STATS_REPOSITORIES = "{invalid}";

  expectEngineError(() => loadConfig(), ["TECH_STATS_REPOSITORIES", "JSON"]);
});

/*
 * 🔐 Local Authentication
 */

test("Local Authentication: No Dedicated Token Required", () => {
  delete process.env.TECH_STATS_TOKEN;

  expect(() =>
    githubClient({
      localGh: true,
    }),
  ).not.toThrow();
});
