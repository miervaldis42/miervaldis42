// 📦 Imports
import { existsSync } from "node:fs";
import path from "node:path";

// 📍 Engine Paths
import { ENGINE_ROOT } from "@constants/paths.js";

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
 * ⚙️ Workflow Setup
 */

describe("Workflow - 'Setup' Step", () => {
  test("Workflow Setup: Checkout, Node & Dependency Installation Order Check", () => {
    const checkout = workflow.indexOf(
      `${GITHUB_WORKFLOW_ID_KEY}${GITHUB_WORKFLOW_STEP_IDS.checkout}`,
    );
    const node = workflow.indexOf(
      `${GITHUB_WORKFLOW_ID_KEY}${GITHUB_WORKFLOW_STEP_IDS.runtime}`,
    );
    const dependencies = workflow.indexOf(
      `${GITHUB_WORKFLOW_ID_KEY}${GITHUB_WORKFLOW_STEP_IDS.dependencies}`,
    );
    const validation = workflow.indexOf(
      `${GITHUB_WORKFLOW_ID_KEY}${GITHUB_WORKFLOW_STEP_IDS.validation}`,
    );

    expect(checkout).toBeGreaterThan(-1);
    expect(node).toBeGreaterThan(checkout);
    expect(dependencies).toBeGreaterThan(node);
    expect(validation).toBeGreaterThan(dependencies);
  });

  test("Workflow Setup: Runtime Version Compatibility Check", () => {
    const nodeVersion = workflow.match(/node-version:\s*["']?(\d+)/)?.[1];
    const pnpmVersion = workflow.match(
      /corepack prepare pnpm@(\d+)\.\d+\.\d+ --activate/,
    )?.[1];

    expect(nodeVersion).toBeDefined();
    expect(Number(nodeVersion)).toBeGreaterThanOrEqual(22);

    expect(pnpmVersion).toBeDefined();
    expect(Number(pnpmVersion)).toBeGreaterThanOrEqual(12);
  });

  test("Workflow Setup: `pnpm` Locked Dependency Installation Check", () => {
    const lockfile = path.join(ENGINE_ROOT, "pnpm-lock.yaml");

    expect(existsSync(lockfile)).toBe(true);
    expect(workflow).toContain(
      `${GITHUB_WORKFLOW_COMMANDS.install} --frozen-lockfile`,
    );
  });
});
