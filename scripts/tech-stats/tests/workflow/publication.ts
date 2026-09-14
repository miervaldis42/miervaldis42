// 🧪📦 Test Imports
import { describe, expect, test } from "vitest";

// 📋 Fixtures
import {
  GITHUB_WORKFLOW_ID_KEY,
  GITHUB_WORKFLOW_STEP_IDS,
} from "@tests/workflow/constants/step-ids.js";
import { GITHUB_WORKFLOW_SECRETS } from "@tests/workflow/constants/secret-names.js";
import { GITHUB_WORKFLOW_BRANCHES } from "@tests/workflow/constants/branches.js";
import { GITHUB_WORKFLOW_COMMIT_HEADERS } from "@tests/workflow/constants/commits.js";
import { workflow } from "@tests/workflow/fixtures/update-tech-stats-workflow.js";

/*
 * 📤 Workflow Publication
 */

describe("Workflow - 'Publication' Step", () => {
  test("Workflow Publication: Generated Statistics Directory Persistence Check", () => {
    const persistenceStep = workflow
      .split(
        `${GITHUB_WORKFLOW_ID_KEY}${GITHUB_WORKFLOW_STEP_IDS.persistence}`,
      )[1]
      ?.split(
        `${GITHUB_WORKFLOW_ID_KEY}${GITHUB_WORKFLOW_STEP_IDS.pullRequest}`,
      )[0];

    expect(persistenceStep).toBeDefined();

    // Check that the generated statistics directory is centralized at workflow level
    expect(workflow).toContain(
      "TECH_STATS_OUTPUT_DIRECTORY: assets/tech-stats/statistics",
    );

    // Check that additions, modifications & deletions are staged dynamically
    expect(persistenceStep).toContain(
      'git add -A -- "$TECH_STATS_OUTPUT_DIRECTORY"',
    );

    // Check that change detection is restricted to the generated statistics directory
    expect(persistenceStep).toContain(
      'git diff --cached --quiet -- "$TECH_STATS_OUTPUT_DIRECTORY"',
    );

    // Check that changed-file reporting uses the same generated statistics directory
    expect(persistenceStep).toContain(
      'git diff --cached --name-only -- "$TECH_STATS_OUTPUT_DIRECTORY"',
    );

    // Check that the generated statistics commit remains restricted to the same directory
    expect(persistenceStep).toContain('-- "$TECH_STATS_OUTPUT_DIRECTORY"');

    // ! Edge Case - Explicit Generated SVG Allowlist
    expect(persistenceStep).not.toMatch(
      /assets\/tech-stats\/statistics\/[a-z0-9-]+\.svg/,
    );

    const unchangedExit = persistenceStep?.indexOf("exit 0") ?? -1;
    const commit =
      persistenceStep?.indexOf("Technology Statistics Update") ?? -1;

    expect(unchangedExit).toBeGreaterThan(-1);
    expect(commit).toBeGreaterThan(unchangedExit);
  });

  test("Workflow Publication: Credential Boundary Check", () => {
    const persistenceStep = workflow
      .split(
        `${GITHUB_WORKFLOW_ID_KEY}${GITHUB_WORKFLOW_STEP_IDS.persistence}`,
      )[1]
      ?.split(
        `${GITHUB_WORKFLOW_ID_KEY}${GITHUB_WORKFLOW_STEP_IDS.pullRequest}`,
      )[0];

    expect(persistenceStep).toBeDefined();
    expect(persistenceStep).toContain("GITHUB_TOKEN: ${{ github.token }}");

    expect(persistenceStep).not.toContain(
      GITHUB_WORKFLOW_SECRETS.analysisToken,
    );
    expect(persistenceStep).not.toContain(
      GITHUB_WORKFLOW_SECRETS.repositoryOverride,
    );

    const pullRequestStep = workflow
      .split(
        `${GITHUB_WORKFLOW_ID_KEY}${GITHUB_WORKFLOW_STEP_IDS.pullRequest}`,
      )[1]
      ?.split(`${GITHUB_WORKFLOW_ID_KEY}${GITHUB_WORKFLOW_STEP_IDS.merge}`)[0];
    expect(pullRequestStep).toBeDefined();
    expect(pullRequestStep).toContain("GH_TOKEN: ${{ github.token }}");

    expect(pullRequestStep).not.toContain(
      GITHUB_WORKFLOW_SECRETS.analysisToken,
    );
    expect(pullRequestStep).not.toContain(
      GITHUB_WORKFLOW_SECRETS.repositoryOverride,
    );
  });

  test("Workflow Publication: Pull Request & Branch Lifecycle Check", () => {
    expect(workflow).toContain(GITHUB_WORKFLOW_COMMIT_HEADERS.update);
    expect(workflow).toContain(GITHUB_WORKFLOW_COMMIT_HEADERS.refresh);
    expect(workflow).toContain("Metadata: gh-pr=$PR_NUMBER");

    expect(workflow).toContain(GITHUB_WORKFLOW_BRANCHES.update);
    expect(workflow).toContain("--force-with-lease");

    const pullRequestStepPosition = workflow.indexOf(
      `${GITHUB_WORKFLOW_ID_KEY}${GITHUB_WORKFLOW_STEP_IDS.pullRequest}`,
    );
    const mergeStepPosition = workflow.indexOf(
      `${GITHUB_WORKFLOW_ID_KEY}${GITHUB_WORKFLOW_STEP_IDS.merge}`,
    );
    const realignmentStepPosition = workflow.indexOf(
      `${GITHUB_WORKFLOW_ID_KEY}${GITHUB_WORKFLOW_STEP_IDS.realignment}`,
    );

    expect(pullRequestStepPosition).toBeGreaterThan(-1);
    expect(mergeStepPosition).toBeGreaterThan(pullRequestStepPosition);
    expect(realignmentStepPosition).toBeGreaterThan(mergeStepPosition);
  });
});
