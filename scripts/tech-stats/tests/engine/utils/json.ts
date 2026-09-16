// 📦 Imports
import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import os from "node:os";
import path from "node:path";

// 🧪📦 Test Imports
import { expect, test } from "vitest";

// 🧰 Utilities
import { readJson } from "@utils/json.js";

// 🎯 Assertions
import { expectEngineError } from "@tests/engine/helpers/assertions.js";

/*
 * 📄 JSON Reading
 */

// Check that valid JSON is read & parsed successfully
test("JSON: Valid File Loading Check", () => {
  const temporaryDirectory = mkdtempSync(
    path.join(os.tmpdir(), "tech-stats-json-"),
  );

  try {
    const filename = path.join(temporaryDirectory, "valid.json");

    writeFileSync(
      filename,
      JSON.stringify({
        name: "Technology Statistics",
      }),
      "utf8",
    );

    expect(readJson(filename)).toEqual({
      name: "Technology Statistics",
    });
  } finally {
    rmSync(temporaryDirectory, {
      recursive: true,
      force: true,
    });
  }
});

// ! Edge case: Missing or unreadable JSON file => error
test("JSON: Missing File Rejection", () => {
  const temporaryDirectory = mkdtempSync(
    path.join(os.tmpdir(), "tech-stats-json-"),
  );

  try {
    const filename = path.join(temporaryDirectory, "missing.json");

    expectEngineError(
      () => readJson(filename),
      ["JSON", "missing.json", "read", "exists"],
    );
  } finally {
    rmSync(temporaryDirectory, {
      recursive: true,
      force: true,
    });
  }
});

// ! Edge case: Malformed JSON syntax => error
test("JSON: Invalid Syntax Rejection", () => {
  const temporaryDirectory = mkdtempSync(
    path.join(os.tmpdir(), "tech-stats-json-"),
  );

  try {
    const filename = path.join(temporaryDirectory, "invalid.json");

    writeFileSync(filename, '{"name":"Technology Statistics"', "utf8");

    expectEngineError(
      () => readJson(filename),
      ["JSON", "invalid.json", "syntax"],
    );
  } finally {
    rmSync(temporaryDirectory, {
      recursive: true,
      force: true,
    });
  }
});
