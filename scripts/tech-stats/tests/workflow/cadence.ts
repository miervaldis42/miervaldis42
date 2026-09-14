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
    expect(evaluateCadenceGuard("schedule", "2026-09-12T12:00:00Z")).toBe(
      false,
    ); // ISO week 37

    expect(evaluateCadenceGuard("schedule", "2026-09-19T12:00:00Z")).toBe(true); // ISO week 38
  });

  test("Manual Run: Cadence Bypass Check", () => {
    expect(
      evaluateCadenceGuard("workflow_dispatch", "2026-09-13T12:00:00Z"),
    ).toBe(true);
  });

  test("Event Triggers: Manual & Event Trigger Check", () => {
    expect(workflow).toContain("workflow_dispatch:");
    expect(workflow).toContain('cron: "0 12 * * 6"');

    // Block future custom event trigger until fully implemented
    expect(workflow).not.toContain("repository_dispatch:");
  });

  // ! Edge Case: Week 53
  test("Scheduled Run: Edge Case - ISO Year Boundary Check", () => {
    expect(evaluateCadenceGuard("schedule", "2026-12-26T12:00:00Z")).toBe(true); // ISO week 52

    expect(evaluateCadenceGuard("schedule", "2027-01-02T12:00:00Z")).toBe(
      false,
    ); // ISO week 53

    expect(evaluateCadenceGuard("schedule", "2027-01-09T12:00:00Z")).toBe(
      false,
    ); // ISO week 1

    expect(evaluateCadenceGuard("schedule", "2027-01-16T12:00:00Z")).toBe(true); // ISO week 2
  });

  // ! Edge Case: Workflow Execution Delay
  test("Scheduled Run: Delay Within the Same ISO Week", () => {
    // Saturday, October 10: ISO week 41 → skip
    // Execution delayed until Sunday, just before UTC midnight
    expect(evaluateCadenceGuard("schedule", "2026-10-11T23:59:59Z")).toBe(
      false,
    );

    // Saturday, October 17: ISO week 42 → proceed
    // Execution delayed until Sunday, just before UTC midnight
    expect(evaluateCadenceGuard("schedule", "2026-10-18T23:59:59Z")).toBe(true);
  });

  test("Scheduled Run: Delay Across the ISO Week Boundary", () => {
    // Saturday, October 10: ISO week 41 → still skip
    // Execution delayed 36 hours into Monday, ISO week 42
    expect(evaluateCadenceGuard("schedule", "2026-10-12T00:00:00Z")).toBe(
      false,
    );

    // Saturday, October 17: ISO week 42 → still proceed
    // Execution delayed 36 hours into Monday, ISO week 43
    expect(evaluateCadenceGuard("schedule", "2026-10-19T00:00:00Z")).toBe(true);
  });
});
