// 🧪📦 Test Imports
import { expect, test } from "vitest";

// 🎯 Assertions
import { expectEngineError } from "@tests/engine/helpers/assertions.js";

// 🧰 Utilities
import { getEngineMode, parseArgs } from "@utils/commands.js";

/*
 * ▶️ Engine Mode
 */

// Check that the supported internal engine modes are recognized
test("Commands: Engine Mode Recognition Check", () => {
  expect(getEngineMode("generate")).toBe("generate");
  expect(getEngineMode("analyze")).toBe("analyze");
});

// ! Edge case: Missing or unsupported engine mode => error
test("Commands: Edge Case - Invalid Engine Mode Rejection", () => {
  expectEngineError(() => getEngineMode(undefined), ["command"]);
  expectEngineError(() => getEngineMode("unknown"), ["command"]);

  expectEngineError(() => parseArgs([]), ["command"]);
  expectEngineError(() => parseArgs(["unknown"]), ["command"]);
});

/*
 * 📈 Generate Arguments
 */

// Check that Generate accepts its expected argument structure
test("Commands: Generate Argument Parsing Check", () => {
  expect(parseArgs(["generate"])).toEqual({
    engineMode: "generate",
  });
});

// ! Edge case: Generate report path => error
test("Commands: Edge Case - Generate Report Path Rejection", () => {
  expectEngineError(
    () => parseArgs(["generate", "--report-path", "/tmp/report.json"]),
    ["report-path", "analyze"],
  );
});

// ! Edge case: Unsupported Generate argument => error
test("Commands: Edge Case - Unexpected Generate Argument Rejection", () => {
  expectEngineError(() => parseArgs(["generate", "unexpected"]), ["command"]);
});

/*
 * 🔬 Analyze Arguments
 */

// Check that Analyze accepts its default report behavior
test("Commands: Analyze Argument Parsing Check", () => {
  expect(parseArgs(["analyze"])).toEqual({
    engineMode: "analyze",
  });
});

// Check that Analyze accepts one explicit report path
test("Commands: Analyze Custom Report Path Check", () => {
  expect(parseArgs(["analyze", "--report-path", "/tmp/report.json"])).toEqual({
    engineMode: "analyze",
    customReportPath: "/tmp/report.json",
  });
});

// ! Edge case: Missing report path value => error
test("Commands: Edge Case - Missing Report Path Rejection", () => {
  expectEngineError(
    () => parseArgs(["analyze", "--report-path"]),
    ["report-path", "value"],
  );

  expectEngineError(
    () => parseArgs(["analyze", "--report-path", "--unexpected"]),
    ["report-path", "value"],
  );
});

// ! Edge case: Unsupported Analyze argument => error
test("Commands: Edge Case - Unexpected Analyze Argument Rejection", () => {
  expectEngineError(() => parseArgs(["analyze", "unexpected"]), ["command"]);
});

// ! Edge case: Additional argument after the report path => error
test("Commands: Edge Case - Additional Argument Rejection", () => {
  expectEngineError(
    () =>
      parseArgs(["analyze", "--report-path", "/tmp/report.json", "unexpected"]),
    ["command"],
  );
});

// ! Edge case: Duplicate report-path option => error
test("Commands: Edge Case - Duplicate Report Path Rejection", () => {
  expectEngineError(
    () =>
      parseArgs([
        "analyze",
        "--report-path",
        "/tmp/report-a.json",
        "--report-path",
        "/tmp/report-b.json",
      ]),
    ["command"],
  );
});
