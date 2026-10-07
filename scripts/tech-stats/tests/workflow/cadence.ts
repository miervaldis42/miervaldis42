// 🧪📦 Test Imports
import { describe, expect, test } from "vitest";

// 📋 Fixtures
import { evaluateCadenceGuard } from "@tests/workflow/fixtures/cadence-guard.js";
import { workflow } from "@tests/workflow/fixtures/update-tech-stats-workflow.js";

/*
 * ⏰ Workflow Cadence
 */

describe("Workflow - 'Cadence' Step", () => {
  test("Scheduled Run: Odd & Even ISO Week Check", () => {
    expect(evaluateCadenceGuard("schedule", "2026-09-13T22:00:00Z")).toBe(
      false,
    ); // ISO week 37

    expect(evaluateCadenceGuard("schedule", "2026-09-20T22:00:00Z")).toBe(true); // ISO week 38
  });

  test("Manual Run: Cadence Bypass Check", () => {
    expect(
      evaluateCadenceGuard("workflow_dispatch", "2026-09-13T22:00:00Z"),
    ).toBe(true);
  });

  test("Event Triggers: Manual & Event Trigger Check", () => {
    expect(workflow).toContain("workflow_dispatch:");
    expect(workflow).toContain('cron: "0 22 * * 0"');

    // Block future custom event trigger until fully implemented
    expect(workflow).not.toContain("repository_dispatch:");
  });

  // ! Edge Case test: Week 53
  test("Scheduled Run: Edge Case - ISO Year Boundary Check", () => {
    expect(evaluateCadenceGuard("schedule", "2026-12-27T22:00:00Z")).toBe(true); // ISO week 52

    expect(evaluateCadenceGuard("schedule", "2027-01-03T22:00:00Z")).toBe(
      false,
    ); // ISO week 53

    expect(evaluateCadenceGuard("schedule", "2027-01-10T22:00:00Z")).toBe(
      false,
    ); // ISO week 1

    expect(evaluateCadenceGuard("schedule", "2027-01-17T22:00:00Z")).toBe(true); // ISO week 2
  });
});
