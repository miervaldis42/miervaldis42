// 🧪📦 Test Imports
import { describe, expect, test } from "vitest";

// 📋 Fixtures
import {
  GITHUB_WORKFLOW_ID_KEY,
  GITHUB_WORKFLOW_STEP_IDS,
} from "@tests/workflow/constants/step-ids.js";
import { GITHUB_WORKFLOW_COMMANDS } from "@tests/workflow/constants/commands.js";
import {
  GITHUB_SECRET_VARIABLE,
  GITHUB_WORKFLOW_SECRETS,
} from "@tests/workflow/constants/secret-names.js";
import { workflow } from "@tests/workflow/fixtures/update-tech-stats-workflow.js";

/*
 * 📊 Workflow Generation
 */

const generationStep = workflow
  .split(`${GITHUB_WORKFLOW_ID_KEY}${GITHUB_WORKFLOW_STEP_IDS.generation}`)[1]
  ?.split(
    `${GITHUB_WORKFLOW_ID_KEY}${GITHUB_WORKFLOW_STEP_IDS.persistence}`,
  )[0];

describe("Workflow - 'Generation' Step", () => {
  test("Workflow Generation: Engine Invocation Check", () => {
    expect(generationStep).toBeDefined();

    expect(generationStep).toContain(
      "working-directory: ${{ env.TECH_STATS_DIRECTORY }}",
    );
    expect(generationStep).toContain(GITHUB_WORKFLOW_COMMANDS.generate);
  });

  test("Workflow Generation: Analysis Credential Boundary Check", () => {
    const analysisTokenSecret = `${GITHUB_SECRET_VARIABLE}${GITHUB_WORKFLOW_SECRETS.analysisToken}`;
    const repositoryOverrideSecret = `${GITHUB_SECRET_VARIABLE}${GITHUB_WORKFLOW_SECRETS.repositoryOverride}`;

    expect(workflow.match(/secrets\.TECH_STATS_TOKEN/g) ?? []).toHaveLength(1);
    expect(
      workflow.match(/secrets\.TECH_STATS_REPOSITORIES/g) ?? [],
    ).toHaveLength(1);

    expect(generationStep).toBeDefined();

    expect(generationStep).toContain(analysisTokenSecret);
    expect(generationStep).toContain(repositoryOverrideSecret);

    expect(generationStep).not.toContain("GITHUB_TOKEN");
    expect(generationStep).not.toContain("GH_TOKEN");
  });
});
