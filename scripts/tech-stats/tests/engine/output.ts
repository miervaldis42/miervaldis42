// 📦 Imports
import {
  existsSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  readdirSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import os from "node:os";
import path from "node:path";

// 🧪📦 Test Imports
import { expect, test } from "vitest";

// 🧠 Engine
import { loadConfig } from "@/load-config.js";
import { calculateMetrics } from "@/metrics.js";
import {
  assertPrivateOutputAbsent,
  generateOutputs,
  readPublicInputs,
  writeGeneratedOutputs,
} from "@/output.js";

// 🏷️ Types
import type { AnalysisReport } from "@customTypes/report.js";

/*
 * 🧩 Fixtures
 */

function createEmptyAnalysisReport(): AnalysisReport {
  const config = loadConfig();
  const summary = calculateMetrics([], config.definitions);

  return {
    schemaVersion: 1,
    timestamp: new Date().toISOString(),
    includedRepositoryCount: 0,
    excludedRepositoryCount: 0,
    selection: [],
    privateRepositoryNames: [],
    repositories: [],
    summary,
  };
}

/*
 * 🔐 Output Privacy
 */

// Check that private repository names cannot appear in public outputs
test("Output Privacy: Private Repository Identifier Rejection Check", () => {
  const privateRepositoryNames = ["owner/hidden-project"];

  const unsafeOutputs = [
    "hidden-project",
    "owner/hidden-project",
    "https://github.com/owner/hidden-project",
    "owner%2Fhidden-project",
    "<!-- hidden-project -->",
  ];

  for (const output of unsafeOutputs) {
    expect(() =>
      assertPrivateOutputAbsent([output], privateRepositoryNames),
    ).toThrow(
      "🔊 Privacy check failed; an output contains a protected identifier. Details suppressed.",
    );
  }
});

// Check that raw & encoded credential material cannot appear in public outputs
test("Output Privacy: Credential Material Rejection Check", () => {
  const secret = "credential/token?private=true";

  const unsafeOutputs = [
    secret,
    encodeURIComponent(secret),
    `prefix-${secret}-suffix`,
  ];

  for (const output of unsafeOutputs) {
    expect(() => assertPrivateOutputAbsent([output], [], [secret])).toThrow(
      "🔊 Privacy check failed; credential material detected.",
    );
  }
});

// Check that unrelated public content is not rejected by partial identifier matches
test("Output Privacy: Safe Public Content Acceptance Check", () => {
  expect(() =>
    assertPrivateOutputAbsent(
      ["React 50.0%", "compatible"],
      ["owner/hidden-project", "owner/pat"],
    ),
  ).not.toThrow();
});

/*
 * 📖 Public Inputs
 */

// Check that public files are read deterministically by directory & filename
test("Public Inputs: Deterministic File Reading Check", () => {
  const temporaryDirectory = mkdtempSync(
    path.join(os.tmpdir(), "tech-stats-public-inputs-"),
  );

  try {
    const firstDirectory = path.join(temporaryDirectory, "first");

    const secondDirectory = path.join(temporaryDirectory, "second");

    mkdirSync(path.join(firstDirectory, "ignored-directory"), {
      recursive: true,
    });

    mkdirSync(secondDirectory, {
      recursive: true,
    });

    writeFileSync(path.join(firstDirectory, "b.txt"), "B", "utf8");

    writeFileSync(path.join(firstDirectory, "a.txt"), "A", "utf8");

    writeFileSync(path.join(secondDirectory, "c.txt"), "C", "utf8");

    const inputs = readPublicInputs([firstDirectory, secondDirectory]);

    expect(inputs).toEqual(["A", "B", "C"]);
  } finally {
    rmSync(temporaryDirectory, {
      recursive: true,
      force: true,
    });
  }
});

/*
 * 💾 Output Persistence
 */

// Check that generated SVGs are persisted with their expected filenames
test("Output Persistence: Generated SVG Writing Check", () => {
  const temporaryDirectory = mkdtempSync(
    path.join(os.tmpdir(), "tech-stats-output-"),
  );

  const targetDirectory = path.join(temporaryDirectory, "statistics");

  try {
    writeGeneratedOutputs(
      {
        "frontend.svg": "<svg>Frontend</svg>",
        "backend-data.svg": "<svg>Backend</svg>",
      },
      targetDirectory,
    );

    expect(
      readFileSync(path.join(targetDirectory, "frontend.svg"), "utf8"),
    ).toBe("<svg>Frontend</svg>");

    expect(
      readFileSync(path.join(targetDirectory, "backend-data.svg"), "utf8"),
    ).toBe("<svg>Backend</svg>");

    expect(readdirSync(targetDirectory).sort()).toEqual([
      "backend-data.svg",
      "frontend.svg",
    ]);

    expect(existsSync(path.join(targetDirectory, "frontend.svg.tmp"))).toBe(
      false,
    );
  } finally {
    rmSync(temporaryDirectory, {
      recursive: true,
      force: true,
    });
  }
});

// ! Edge case: Unsafe or unsupported generated filename => error
test("Output Persistence: Edge Case - Invalid Filename Rejection", () => {
  const temporaryDirectory = mkdtempSync(
    path.join(os.tmpdir(), "tech-stats-output-"),
  );

  try {
    expect(() =>
      writeGeneratedOutputs(
        {
          "../private.svg": "<svg></svg>",
        },
        temporaryDirectory,
      ),
    ).toThrow("🔊 Invalid generated output filename.");
  } finally {
    rmSync(temporaryDirectory, {
      recursive: true,
      force: true,
    });
  }
});

/*
 * 🎨 Output Generation
 */

// Check that every configured statistics section generates a validated SVG output
test("Output Generation: Statistics Section Generation Check", () => {
  const config = loadConfig();

  const report = createEmptyAnalysisReport();

  const result = generateOutputs(report, config);

  const expectedFilenames = config.definitions
    .map((section) => `${section.id}.svg`)
    .sort();

  expect(Object.keys(result.outputs).sort()).toEqual(expectedFilenames);

  expect(result.analyzedRepositories).toBe(0);

  for (const filename of expectedFilenames) {
    expect(result.outputs[filename]).toContain("<svg");
  }
});
