// 📦 Imports
import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import os from "node:os";
import path from "node:path";

// 🧪📦 Test Imports
import { expect, test } from "vitest";

// 🧠 Engine
import { loadConfig } from "@/load-config.js";
import { calculateMetrics } from "@/metrics.js";
import { embedIcon, renderStatisticsSection, validateSvg } from "@/render.js";

// 🏷️ Types
import type { StatisticsDefinition } from "@customTypes/definitions.js";

/*
 * 🧩 Fixtures
 */

const config = loadConfig();

const summary = calculateMetrics([], config.definitions);

function temporaryIconDirectory(): string {
  return mkdtempSync(path.join(os.tmpdir(), "tech-stats-icons-"));
}

/*
 * 🖼️ SVG Icons
 */

// Check that local icon IDs & their references are namespaced before embedding
test("SVG Icon: Internal ID Namespacing Check", () => {
  const iconDirectory = temporaryIconDirectory();

  try {
    writeFileSync(
      path.join(iconDirectory, "test.svg"),
      [
        '<svg viewBox="0 0 24 24">',
        "  <defs>",
        '    <linearGradient id="paint">',
        "    </linearGradient>",
        "  </defs>",
        '  <path fill="url(#paint)" d="M0 0h24v24H0z"/>',
        '  <use href="#paint"/>',
        "</svg>",
      ].join("\n"),
      "utf8",
    );

    const icon = embedIcon("test.svg", iconDirectory, "technology", 48, 16);

    expect(icon).toContain('id="technology-paint"');

    expect(icon).toContain("url(#technology-paint)");

    expect(icon).toContain('href="#technology-paint"');

    expect(icon).not.toContain('id="paint"');
  } finally {
    rmSync(iconDirectory, {
      recursive: true,
      force: true,
    });
  }
});

// ! Edge case: Icon contains non-local or executable SVG content => error
test("SVG Icon: Edge Case - Unsafe Geometry Rejection", () => {
  const iconDirectory = temporaryIconDirectory();

  try {
    writeFileSync(
      path.join(iconDirectory, "unsafe.svg"),
      [
        '<svg viewBox="0 0 24 24">',
        '  <script>alert("Nope")</script>',
        "</svg>",
      ].join("\n"),
      "utf8",
    );

    expect(() =>
      embedIcon("unsafe.svg", iconDirectory, "unsafe", 48, 16),
    ).toThrow("🔊 Icon must contain only local vector geometry.");
  } finally {
    rmSync(iconDirectory, {
      recursive: true,
      force: true,
    });
  }
});

/*
 * 🎨 Statistics Rendering
 */

// Check that every configured section renders reproducibly as a valid SVG
test("SVG Rendering: Deterministic Statistics Section Generation Check", () => {
  for (const section of config.definitions) {
    const firstRender = renderStatisticsSection(
      section,
      summary,
      config.rendering,
      config.resolvedPaths.icons,
    );

    const secondRender = renderStatisticsSection(
      section,
      summary,
      config.rendering,
      config.resolvedPaths.icons,
    );

    expect(firstRender).toBe(secondRender);

    expect(() => validateSvg(firstRender, section)).not.toThrow();

    expect(firstRender.match(/class="card"/g)?.length ?? 0).toBe(
      section.technologies.length,
    );

    expect(firstRender).not.toContain("<image");
  }
});

// Check that cards wrap according to the configured maximum row size
test("SVG Rendering: Configured Row Wrapping Check", () => {
  const technologies = config.definitions
    .flatMap((section) => section.technologies)
    .slice(0, 5);

  expect(technologies).toHaveLength(5);

  const section: StatisticsDefinition = {
    id: "wrapping-test",
    title: "Wrapping Test",
    technologies,
  };

  const svg = renderStatisticsSection(
    section,
    summary,
    {
      ...config.rendering,
      layout: {
        ...config.rendering.layout,
        maxCardsPerRow: 3,
      },
    },
    config.resolvedPaths.icons,
  );

  const cardRows = [
    ...svg.matchAll(/class="card" transform="translate\([\d.]+ ([\d.]+)\)"/g),
  ].map((match) => match[1]);

  expect(new Set(cardRows).size).toBe(2);
});

// Check that rows stay centered without changing card dimensions
test("SVG Layout: Card Row Centering Check", () => {
  const technologies = config.definitions
    .flatMap((section) => section.technologies)
    .slice(0, 5);

  for (const canvasWidth of [560, 700]) {
    for (let count = 1; count <= 5; count += 1) {
      const section: StatisticsDefinition = {
        id: "layout-test",
        title: "Layout Test",
        technologies: technologies.slice(0, count),
      };

      const svg = renderStatisticsSection(
        section,
        summary,
        {
          ...config.rendering,
          layout: {
            ...config.rendering.layout,
            canvasWidth,
          },
        },
        config.resolvedPaths.icons,
      );

      expect(Number(svg.match(/viewBox="0 0 (\d+)/)?.[1])).toBe(canvasWidth);

      expect(svg).toContain(
        `width="${config.rendering.layout.iconSize}" height="${config.rendering.layout.iconSize}"`,
      );

      expect(svg).toContain(
        `width="${config.rendering.layout.pillWidth}" height="${config.rendering.layout.pillHeight}"`,
      );

      const rows = new Map<string, number[]>();

      for (const match of svg.matchAll(
        /class="card" transform="translate\(([\d.]+) ([\d.]+)\)"/g,
      )) {
        const x = match[1];
        const y = match[2];

        if (!x || !y) {
          continue;
        }

        const centers = rows.get(y) ?? [];

        centers.push(Number(x));

        rows.set(y, centers);
      }

      for (const centers of rows.values()) {
        expect((centers[0]! + centers.at(-1)!) / 2).toBe(canvasWidth / 2);
      }
    }
  }
});

// ! Edge case: Canvas cannot contain its configured cards => error
test("SVG Layout: Edge Case - Narrow Canvas Rejection", () => {
  expect(() =>
    renderStatisticsSection(
      config.definitions[0]!,
      summary,
      {
        ...config.rendering,
        layout: {
          ...config.rendering.layout,
          canvasWidth: 100,
        },
      },
      config.resolvedPaths.icons,
    ),
  ).toThrow("🔊 Cards do not fit the configured canvas width.");
});

/*
 * ✅ SVG Validation
 */

// ! Edge case: Generated SVG contains executable or external content => error
test("SVG Validation: Edge Case - Unsafe Content Rejection", () => {
  const section = config.definitions[0]!;

  const svg = renderStatisticsSection(
    section,
    summary,
    config.rendering,
    config.resolvedPaths.icons,
  );

  const unsafeSvg = svg.replace(
    "</svg>",
    '<script>alert("Nope")</script></svg>',
  );

  expect(() => validateSvg(unsafeSvg, section)).toThrow(
    "🔊 Unsafe SVG content.",
  );
});

// ! Edge case: Generated SVG contains duplicate IDs => error
test("SVG Validation: Edge Case - Duplicate ID Rejection", () => {
  const section = config.definitions[0]!;

  const svg = renderStatisticsSection(
    section,
    summary,
    config.rendering,
    config.resolvedPaths.icons,
  );

  const unsafeSvg = svg.replace("</svg>", '<g id="title"></g></svg>');

  expect(() => validateSvg(unsafeSvg, section)).toThrow(
    "🔊 Duplicate SVG IDs.",
  );
});
