// 🧪📦 Test Imports
import { describe, expect, test } from "vitest";

// 📋 Fixtures
import {
  GITHUB_WORKFLOW_ID_KEY,
  GITHUB_WORKFLOW_STEP_IDS,
} from "@tests/workflow/constants/step-ids.js";
import { GITHUB_WORKFLOW_COMMANDS } from "@tests/workflow/constants/commands.js";
import { workflow } from "@tests/workflow/fixtures/update-tech-stats-workflow.js";

/*
 * ✅ Workflow Validation
 */

describe("Workflow - 'Validation' Step", () => {
  test("Workflow Validation: Typecheck, Test & Generation Order Check", () => {
    const validationId = `${GITHUB_WORKFLOW_ID_KEY}${GITHUB_WORKFLOW_STEP_IDS.validation}`;
    const generationId = `${GITHUB_WORKFLOW_ID_KEY}${GITHUB_WORKFLOW_STEP_IDS.generation}`;
    const validationPosition = workflow.indexOf(validationId);
    const generationPosition = workflow.indexOf(generationId);

    expect(validationPosition).toBeGreaterThan(-1);
    expect(generationPosition).toBeGreaterThan(validationPosition);

    const validationStep = workflow
      .split(validationId)[1]
      ?.split(generationId)[0];
    expect(validationStep).toBeDefined();

    const typecheck =
      validationStep?.indexOf(GITHUB_WORKFLOW_COMMANDS.typecheck) ?? -1;
    const tests = validationStep?.indexOf(GITHUB_WORKFLOW_COMMANDS.test) ?? -1;

    expect(typecheck).toBeGreaterThan(-1);
    expect(tests).toBeGreaterThan(typecheck);
  });

  // ! Edge Case - Legacy Commands
  test("Workflow Validation: Legacy Command Rejection Check", () => {
    expect(workflow).not.toContain("pnpm run tech-stats -- update");

    expect(workflow).not.toContain(
      "node --test scripts/tech-stats/tests/*.test.mjs",
    );

    expect(workflow).not.toContain("node scripts/tech-stats/index.mjs update");
  });
});
