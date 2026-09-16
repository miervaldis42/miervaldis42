// 🧪📦 Test Imports
import { expect, test } from "vitest";

// 🧠 Engine
import { calculateMetrics } from "@/metrics.js";

// 🧩 Fixtures
import { analyzedRepository } from "@tests/engine/fixtures/analysis.js";

// 🏷️ Types
import type { StatisticsDefinition } from "@customTypes/definitions.js";

/*
 * 🧩 Fixtures
 */

const definitions: StatisticsDefinition[] = [
  {
    id: "test-section",
    title: "Test Section",
    technologies: [
      {
        id: "typescript",
        name: "TypeScript",
        metric: "language",
        language: "TypeScript",
        icon: "typescript.svg",
      },
      {
        id: "javascript",
        name: "JavaScript",
        metric: "language",
        language: "JavaScript",
        icon: "javascript.svg",
      },
      {
        id: "css",
        name: "CSS",
        metric: "language",
        language: "CSS",
        icon: "css.svg",
      },
      {
        id: "react",
        name: "React",
        metric: "adoption",
        rule: "react",
        icon: "react.svg",
      },
      {
        id: "figma",
        name: "Figma",
        metric: "curated",
        label: "Curated",
        icon: "figma.svg",
      },
    ],
  },
];

/*
 * 📈 Metric Calculation
 */

// For analyzed repositories, check if the metrics function can calculate the correct metrics
test("Metric: Repository Language & Technology Calculation Check", () => {
  const repositories = [
    analyzedRepository("owner/repository", {
      languages: {
        TypeScript: 75,
        CSS: 25,
        SCSS: 900,
      },
      evidence: {
        react: [
          {
            path: "package.json",
            signal: "direct package declaration: react",
          },
          {
            path: "apps/web/package.json",
            signal: "direct package declaration: react",
          },
        ],
      },
    }),
    analyzedRepository("owner/empty-repository"),
  ];

  const summary = calculateMetrics(repositories, definitions);

  expect(summary.languageBytes).toBe(100);
  expect(summary.metrics.typescript?.label).toBe("75.0%");
  expect(summary.metrics.javascript?.label).toBe("0.0%");
  expect(summary.metrics.css?.label).toBe("25.0%");
  expect(summary.metrics.react?.label).toBe("50.0%");
  expect(summary.metrics.figma?.label).toBe("Curated");
});

// ! Edge case: Empty Analysis => 'No data' result
test("Metric: Edge Case - Empty Analysis", () => {
  const summary = calculateMetrics([], definitions);

  expect(summary.metrics.react?.label).toBe("No data");
  expect(summary.metrics.typescript?.label).toBe("No data");
});

// ! Edge case: Unexpected Linguist Byte data => error
test("Metric: Edge Case - Invalid Linguist Byte Rejection", () => {
  const repositories = [
    analyzedRepository("owner/repository", {
      languages: {
        CSS: -1,
      },
    }),
  ];

  expect(() => calculateMetrics(repositories, definitions)).toThrow(
    "🔊 Invalid Linguist bytes.",
  );
});
