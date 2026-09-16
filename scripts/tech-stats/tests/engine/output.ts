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

// ⚙️ Engine
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

// 🎯 Assertions
import { expectEngineError } from "@tests/engine/helpers/assertions.js";

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
    expectEngineError(
      () => assertPrivateOutputAbsent([output], privateRepositoryNames),
      ["privacy", "identifier"],
    );
  }
});

// Check that private repository matching handles case & regex characters literally
test("Output Privacy: Repository Identifier Matching Robustness Check", () => {
  const privateRepositoryNames = ["owner/secret.project"];

  const unsafeOutputs = [
    "owner/secret.project",
    "OWNER/SECRET.PROJECT",
    "secret.project",
    "owner%2Fsecret.project",
  ];

  for (const output of unsafeOutputs) {
    expectEngineError(
      () => assertPrivateOutputAbsent([output], privateRepositoryNames),
      ["privacy", "identifier"],
    );
  }

  expect(() =>
    assertPrivateOutputAbsent(
      ["secretXproject", "my-secret.project-helper"],
      privateRepositoryNames,
    ),
  ).not.toThrow();
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
    expectEngineError(
      () => assertPrivateOutputAbsent([output], [], [secret]),
      ["privacy", "credential"],
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

    writeFileSync(
      path.join(firstDirectory, "ignored-directory", "ignored.txt"),
      "IGNORED",
      "utf8",
    );

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

// ! Edge case: Public input directory cannot be read => error
test("Public Inputs: Edge Case - Missing Directory Rejection", () => {
  const temporaryDirectory = mkdtempSync(
    path.join(os.tmpdir(), "tech-stats-public-inputs-"),
  );

  try {
    expectEngineError(
      () =>
        readPublicInputs([path.join(temporaryDirectory, "missing-directory")]),
      ["public", "inputs", "read", "privacy"],
    );
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

// Check that SVGs without a current generated output are removed
test("Output Persistence: Obsolete SVG Removal Check", () => {
  const temporaryDirectory = mkdtempSync(
    path.join(os.tmpdir(), "tech-stats-output-"),
  );

  const targetDirectory = path.join(temporaryDirectory, "statistics");
  try {
    mkdirSync(targetDirectory, {
      recursive: true,
    });

    writeFileSync(
      path.join(targetDirectory, "obsolete.svg"),
      "<svg>Obsolete</svg>",
      "utf8",
    );

    writeGeneratedOutputs(
      {
        "frontend.svg": "<svg>Frontend</svg>",
      },
      targetDirectory,
    );

    expect(existsSync(path.join(targetDirectory, "frontend.svg"))).toBe(true);
    expect(existsSync(path.join(targetDirectory, "obsolete.svg"))).toBe(false);

    expect(readdirSync(targetDirectory)).toEqual(["frontend.svg"]);
  } finally {
    rmSync(temporaryDirectory, {
      recursive: true,
      force: true,
    });
  }
});

// Check that temporary generated files left by interrupted writes are removed
test("Output Persistence: Interrupted Temporary File Cleanup Check", () => {
  const temporaryDirectory = mkdtempSync(
    path.join(os.tmpdir(), "tech-stats-output-"),
  );

  const targetDirectory = path.join(temporaryDirectory, "statistics");

  try {
    mkdirSync(targetDirectory, {
      recursive: true,
    });

    writeFileSync(
      path.join(targetDirectory, "obsolete.svg.tmp"),
      "<svg>Interrupted</svg>",
      "utf8",
    );

    writeFileSync(
      path.join(targetDirectory, "notes.tmp"),
      "Unrelated temporary file",
      "utf8",
    );

    writeGeneratedOutputs(
      {
        "frontend.svg": "<svg>Frontend</svg>",
      },
      targetDirectory,
    );

    expect(existsSync(path.join(targetDirectory, "obsolete.svg.tmp"))).toBe(
      false,
    );

    expect(readFileSync(path.join(targetDirectory, "notes.tmp"), "utf8")).toBe(
      "Unrelated temporary file",
    );
  } finally {
    rmSync(temporaryDirectory, {
      recursive: true,
      force: true,
    });
  }
});

// Check that unrelated non-SVG files remain untouched during output synchronization
test("Output Persistence: Non-SVG File Preservation Check", () => {
  const temporaryDirectory = mkdtempSync(
    path.join(os.tmpdir(), "tech-stats-output-"),
  );

  const targetDirectory = path.join(temporaryDirectory, "statistics");

  try {
    mkdirSync(targetDirectory, {
      recursive: true,
    });

    writeFileSync(
      path.join(targetDirectory, "README.md"),
      "Documentation",
      "utf8",
    );

    writeGeneratedOutputs(
      {
        "frontend.svg": "<svg>Frontend</svg>",
      },
      targetDirectory,
    );

    expect(existsSync(path.join(targetDirectory, "README.md"))).toBe(true);
  } finally {
    rmSync(temporaryDirectory, {
      recursive: true,
      force: true,
    });
  }
});

// ! Edge case: Output directory cannot be created or written => error
test("Output Persistence: Edge Case - Unwritable Target Rejection", () => {
  const temporaryDirectory = mkdtempSync(
    path.join(os.tmpdir(), "tech-stats-output-"),
  );

  try {
    const blockingFile = path.join(temporaryDirectory, "blocked");

    writeFileSync(blockingFile, "Not a directory", "utf8");

    const targetDirectory = path.join(blockingFile, "statistics");

    expectEngineError(
      () =>
        writeGeneratedOutputs(
          {
            "frontend.svg": "<svg>Frontend</svg>",
          },
          targetDirectory,
        ),
      ["outputs", "saved", "directory", "writable"],
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

  const targetDirectory = path.join(temporaryDirectory, "statistics");

  try {
    expectEngineError(
      () =>
        writeGeneratedOutputs(
          {
            "../private.svg": "<svg></svg>",
          },
          targetDirectory,
        ),
      ["invalid", "filename"],
    );

    // Invalid outputs must be rejected before creating the target directory
    expect(existsSync(targetDirectory)).toBe(false);
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
