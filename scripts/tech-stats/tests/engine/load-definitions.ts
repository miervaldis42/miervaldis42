// 📦 Imports
import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import os from "node:os";
import path from "node:path";

// 🧪📦 Test Imports
import { expect, test } from "vitest";

// 🧠 Engine
import { loadDefinitions } from "@/load-definitions.js";

/*
 * 🧩 Fixtures
 */

function createDefinition(
  id: string,
  technologyId: string,
): Record<string, unknown> {
  return {
    $schema: "../schemas/statistics-definition.schema.json",
    id,
    title: "Test Section",
    technologies: [
      {
        id: technologyId,
        name: "Test Technology",
        metric: "adoption",
        rule: technologyId,
        icon: "test.svg",
      },
    ],
  };
}

function writeDefinition(
  directory: string,
  filename: string,
  definition: unknown,
): void {
  writeFileSync(
    path.join(directory, filename),
    JSON.stringify(definition),
    "utf8",
  );
}

/*
 * 📚 Definition Loading
 */

// Check that a valid statistics definition is loaded successfully
test("Definition Loading: Valid Definition Check", () => {
  const temporaryDirectory = mkdtempSync(
    path.join(os.tmpdir(), "tech-stats-definitions-"),
  );

  try {
    writeDefinition(
      temporaryDirectory,
      "frontend.json",
      createDefinition("frontend", "react"),
    );

    const definitions = loadDefinitions(temporaryDirectory);

    expect(definitions).toHaveLength(1);
    expect(definitions[0]?.id).toBe("frontend");
    expect(definitions[0]?.technologies[0]?.id).toBe("react");
  } finally {
    rmSync(temporaryDirectory, {
      recursive: true,
      force: true,
    });
  }
});

// Check that definition filenames remain independent from their section IDs
test("Definition Loading: Filename Independence Check", () => {
  const temporaryDirectory = mkdtempSync(
    path.join(os.tmpdir(), "tech-stats-definitions-"),
  );

  try {
    writeDefinition(
      temporaryDirectory,
      "banana.json",
      createDefinition("frontend", "react"),
    );

    const definitions = loadDefinitions(temporaryDirectory);

    expect(definitions[0]?.id).toBe("frontend");
  } finally {
    rmSync(temporaryDirectory, {
      recursive: true,
      force: true,
    });
  }
});

// Check that malformed statistics definitions are rejected by the schema
test("Definition Loading: Invalid Schema Check", () => {
  const temporaryDirectory = mkdtempSync(
    path.join(os.tmpdir(), "tech-stats-definitions-"),
  );

  try {
    writeDefinition(temporaryDirectory, "invalid.json", {
      $schema: "../schemas/statistics-definition.schema.json",
      id: "frontend",
      title: "Frontend",
      technologies: [
        {
          id: "react",
          name: "React",
          metric: "adoption",
          icon: "react.svg",
        },
      ],
    });

    expect(() => loadDefinitions(temporaryDirectory)).toThrow(
      "🔊 Invalid statistics definition: invalid.json.",
    );
  } finally {
    rmSync(temporaryDirectory, {
      recursive: true,
      force: true,
    });
  }
});

// Check that multiple definitions cannot declare the same section ID
test("Definition Loading: Duplicate Section ID Rejection Check", () => {
  const temporaryDirectory = mkdtempSync(
    path.join(os.tmpdir(), "tech-stats-definitions-"),
  );

  try {
    writeDefinition(
      temporaryDirectory,
      "first.json",
      createDefinition("frontend", "react"),
    );

    writeDefinition(
      temporaryDirectory,
      "second.json",
      createDefinition("frontend", "vue"),
    );

    expect(() => loadDefinitions(temporaryDirectory)).toThrow(
      "🔊 Duplicate statistics section definition: frontend.",
    );
  } finally {
    rmSync(temporaryDirectory, {
      recursive: true,
      force: true,
    });
  }
});

// Check that technology IDs remain unique across all statistics definitions
test("Definition Loading: Duplicate Technology ID Rejection Check", () => {
  const temporaryDirectory = mkdtempSync(
    path.join(os.tmpdir(), "tech-stats-definitions-"),
  );

  try {
    writeDefinition(
      temporaryDirectory,
      "first.json",
      createDefinition("frontend", "react"),
    );

    writeDefinition(
      temporaryDirectory,
      "second.json",
      createDefinition("ui-systems", "react"),
    );

    expect(() => loadDefinitions(temporaryDirectory)).toThrow(
      "🔊 Duplicate technology definition: react.",
    );
  } finally {
    rmSync(temporaryDirectory, {
      recursive: true,
      force: true,
    });
  }
});

// ! Edge Case - Check that metric-specific properties cannot be mixed across metric strategies
test("Definition Loading: Metric Property Exclusivity Check", () => {
  const temporaryDirectory = mkdtempSync(
    path.join(os.tmpdir(), "tech-stats-definitions-"),
  );

  try {
    writeDefinition(temporaryDirectory, "invalid.json", {
      $schema: "../schemas/statistics-definition.schema.json",
      id: "frontend",
      title: "Frontend",
      technologies: [
        {
          id: "typescript",
          name: "TypeScript",
          metric: "language",
          language: "TypeScript",
          rule: "typescript",
          icon: "typescript.svg",
        },
      ],
    });

    expect(() => loadDefinitions(temporaryDirectory)).toThrow(
      "🔊 Invalid statistics definition: invalid.json.",
    );
  } finally {
    rmSync(temporaryDirectory, {
      recursive: true,
      force: true,
    });
  }
});

// ! Edge Case - Check that a technology cannot define both icon strategies at the same time
test("Definition Loading: Icon Strategy Exclusivity Check", () => {
  const temporaryDirectory = mkdtempSync(
    path.join(os.tmpdir(), "tech-stats-definitions-"),
  );

  try {
    writeDefinition(temporaryDirectory, "invalid.json", {
      $schema: "../schemas/statistics-definition.schema.json",
      id: "frontend",
      title: "Frontend",
      technologies: [
        {
          id: "react",
          name: "React",
          metric: "adoption",
          rule: "react",
          icon: "react.svg",
          icons: {
            light: "react-light.svg",
            dark: "react-dark.svg",
          },
        },
      ],
    });

    expect(() => loadDefinitions(temporaryDirectory)).toThrow(
      "🔊 Invalid statistics definition: invalid.json.",
    );
  } finally {
    rmSync(temporaryDirectory, {
      recursive: true,
      force: true,
    });
  }
});
