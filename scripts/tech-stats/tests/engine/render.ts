// 📦 Imports
import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import os from "node:os";
import path from "node:path";

// 🧪📦 Test Imports
import { expect, test } from "vitest";

// ⚙️ Engine
import { loadConfig } from "@/load-config.js";
import { calculateMetrics } from "@/metrics.js";
import { embedIcon, renderStatisticsSection, validateSvg } from "@/render.js";

// 🏷️ Types
import type { StatisticsDefinition } from "@customTypes/definitions.js";

// 🎯 Assertions
import { expectEngineError } from "@tests/engine/helpers/assertions.js";

/*
 * 🧩 Fixtures
 */

const config = loadConfig();

const summary = calculateMetrics([], config.definitions);

// Create a temporary directory for storing test icons
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
    // Deliberately mix quote styles & reference syntaxes to verify that namespacing does not depend on one particular SVG serialization format
    writeFileSync(
      path.join(iconDirectory, "test.svg"),
      [
        "<svg viewBox='0 0 24 24' fill='none'>",
        "  <defs>",
        "    <linearGradient id='paint'>",
        "    </linearGradient>",
        '    <clipPath id="clip">',
        "    </clipPath>",
        "  </defs>",
        `  <path fill="url('#paint')" clip-path='url("#clip")' d="M0 0h24v24H0z"/>`,
        "  <use href = '#paint'/>",
        "</svg>",
      ].join("\n"),
      "utf8",
    );

    const icon = embedIcon("test.svg", iconDirectory, "technology", 48, 16);

    // Root SVG attributes should be normalized correctly during embedding
    expect(icon).toContain('viewBox="0 0 24 24"');
    expect(icon).toContain('fill="none"');

    // Every supported local-reference form should point to the namespaced IDs
    expect(icon).toContain("id='technology-paint'");
    expect(icon).toContain('id="technology-clip"');

    expect(icon).toContain("url('#technology-paint')");
    expect(icon).toContain('url("#technology-clip")');

    expect(icon).toContain("href = '#technology-paint'");

    expect(icon).not.toContain("url('#paint')");
    expect(icon).not.toContain('url("#clip")');
  } finally {
    rmSync(iconDirectory, {
      recursive: true,
      force: true,
    });
  }
});

// ! Edge case: Configured icon file cannot be read => error
test("SVG Icon: Edge Case - Missing File Rejection", () => {
  const iconDirectory = temporaryIconDirectory();

  try {
    expectEngineError(
      () => embedIcon("missing.svg", iconDirectory, "technology", 48, 16),
      ["icon", "missing.svg", "read"],
    );
  } finally {
    rmSync(iconDirectory, {
      recursive: true,
      force: true,
    });
  }
});

// ! Edge case: Existing icon ID already contains the namespace prefix
test("SVG Icon: Edge Case - Internal ID Prefix Collision Prevention", () => {
  const iconDirectory = temporaryIconDirectory();

  try {
    // Use one ID that already contains the chosen prefix.
    // A sequential replacement implementation could otherwise rewrite
    // `paint` into `technology-paint` and then mutate that generated ID again.
    writeFileSync(
      path.join(iconDirectory, "collision.svg"),
      [
        '<svg viewBox="0 0 24 24">',
        "  <defs>",
        '    <linearGradient id="paint"></linearGradient>',
        '    <linearGradient id="technology-paint"></linearGradient>',
        "  </defs>",
        '  <path fill="url(#paint)" d="M0 0h12v24H0z"/>',
        '  <path fill="url(#technology-paint)" d="M12 0h12v24H12z"/>',
        "</svg>",
      ].join("\n"),
      "utf8",
    );

    const icon = embedIcon(
      "collision.svg",
      iconDirectory,
      "technology",
      48,
      16,
    );

    expect(icon).toContain('id="technology-paint"');
    expect(icon).toContain('id="technology-technology-paint"');

    expect(icon).toContain("url(#technology-paint)");
    expect(icon).toContain("url(#technology-technology-paint)");
  } finally {
    rmSync(iconDirectory, {
      recursive: true,
      force: true,
    });
  }
});

// ! Edge case: Icon contains code, animation, links or external resources => error
test("SVG Icon: Edge Case - Unsafe Content Rejection", () => {
  const iconDirectory = temporaryIconDirectory();

  try {
    const unsafeContents = [
      '<script>alert("Nope")</script>',
      "<style>.shape { fill: red; }</style>",
      '<animate attributeName="opacity" values="0;1" dur="1s"/>',
      '<set attributeName="opacity" to="0"/>',
      '<a href="#target"><path d="M0 0h24v24H0z"/></a>',
      '<image href="https://example.com/image.svg"/>',
      '<path fill="url(https://example.com/paint.svg#gradient)" d="M0 0h24v24H0z"/>',
    ];

    for (const [index, unsafeContent] of unsafeContents.entries()) {
      const filename = `unsafe-${index}.svg`;

      writeFileSync(
        path.join(iconDirectory, filename),
        ['<svg viewBox="0 0 24 24">', unsafeContent, "</svg>"].join("\n"),
        "utf8",
      );

      expectEngineError(
        () => embedIcon(filename, iconDirectory, "unsafe", 48, 16),
        ["icon", "static"],
      );
    }
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

// Check that the SVG description explains every metric type used by a section
test("SVG Rendering: Metric Description Check", () => {
  const technologies = config.definitions.flatMap(
    (section) => section.technologies,
  );

  const language = technologies.find(
    (technology) => technology.metric === "language",
  );

  const adoption = technologies.find(
    (technology) => technology.metric === "adoption",
  );

  const curated = technologies.find(
    (technology) => technology.metric === "curated",
  );

  expect(language).toBeDefined();
  expect(adoption).toBeDefined();
  expect(curated).toBeDefined();

  const section: StatisticsDefinition = {
    id: "metric-description-test",
    title: "Metric Description Test",
    technologies: [language!, adoption!, curated!],
  };

  const svg = renderStatisticsSection(
    section,
    summary,
    config.rendering,
    config.resolvedPaths.icons,
  );

  const description = svg.match(
    /<desc id="description">([\s\S]*?)<\/desc>/,
  )?.[1];

  expect(description).toBeDefined();

  expect(description?.toLowerCase()).toContain("language");
  expect(description?.toLowerCase()).toContain("adoption");
  expect(description?.toLowerCase()).toContain("curated");
  expect(description?.toLowerCase()).toContain("proficiency");

  // The proficiency disclaimer should appear once, not be duplicated
  expect(description?.match(/proficiency/gi)).toHaveLength(1);
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
  expectEngineError(
    () =>
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
    ["cards", "canvas"],
  );
});

/*
 * ✅ SVG Validation
 */

// ! Edge case: Embedded icon viewBox must not replace the root SVG viewBox
test("SVG Validation: Edge Case - Missing Root ViewBox Rejection", () => {
  const section = config.definitions[0]!;

  const svg = renderStatisticsSection(
    section,
    summary,
    config.rendering,
    config.resolvedPaths.icons,
  );

  // Remove only the root viewBox; embedded technology icons retain theirs
  const missingRootViewBox = svg.replace(
    /^<svg([^>]*)\sviewBox="[^"]+"/,
    "<svg$1",
  );

  expectEngineError(() => validateSvg(missingRootViewBox, section), ["sizing"]);
});

// ! Edge case: Non-group elements must not satisfy the generated card count
test("SVG Validation: Edge Case - Spoofed Card Count Rejection", () => {
  const section = config.definitions[0]!;

  const svg = renderStatisticsSection(
    section,
    summary,
    config.rendering,
    config.resolvedPaths.icons,
  );

  const spoofedCardSvg = svg
    .replace('<g class="card"', '<g class="not-card"')
    .replace("</svg>", '<rect class="card"/></svg>');

  expectEngineError(
    () => validateSvg(spoofedCardSvg, section),
    ["card", "count"],
  );
});

// ! Edge case: Theme variant identifiers must belong to the expected wrapper groups
test("SVG Validation: Edge Case - Spoofed Theme Variant Rejection", () => {
  const technology = config.definitions
    .flatMap((section) => section.technologies)
    .find((technology) => technology.icons !== undefined);

  expect(technology).toBeDefined();

  const section: StatisticsDefinition = {
    id: "theme-validation-test",
    title: "Theme Validation Test",
    technologies: [technology!],
  };

  const svg = renderStatisticsSection(
    section,
    summary,
    config.rendering,
    config.resolvedPaths.icons,
  );

  const malformedSvg = svg
    .replace(
      `id="${technology!.id}-light-variant"`,
      'id="missing-light-variant"',
    )
    .replace(`id="${technology!.id}-dark-variant"`, 'id="missing-dark-variant"')
    .replace(
      "</svg>",
      `<!-- ${technology!.id}-light ${technology!.id}-dark --></svg>`,
    );

  expectEngineError(
    () => validateSvg(malformedSvg, section),
    ["theme", "variant"],
  );
});

// ! Edge case: Generated SVG contains code, animation, links or external resources => error
test("SVG Validation: Edge Case - Unsafe Content Rejection", () => {
  const section = config.definitions[0]!;

  const svg = renderStatisticsSection(
    section,
    summary,
    config.rendering,
    config.resolvedPaths.icons,
  );

  const unsafeContents = [
    '<script>alert("Nope")</script>',
    '<animate attributeName="opacity" values="0;1" dur="1s"/>',
    '<set attributeName="opacity" to="0"/>',
    '<a href="#title">Interactive content</a>',
    '<image href="https://example.com/image.svg"/>',
    '<style>@import "https://example.com/external.css";</style>',
    "<style>@keyframes pulse { from { opacity: 0; } to { opacity: 1; } }</style>",
  ];

  for (const unsafeContent of unsafeContents) {
    const unsafeSvg = svg.replace("</svg>", `${unsafeContent}</svg>`);

    expectEngineError(() => validateSvg(unsafeSvg, section), ["svg", "unsafe"]);
  }
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

  // Duplicate-ID detection must not depend on the quote style used by the SVG
  const doubleQuotedDuplicateSvg = svg.replace(
    "</svg>",
    '<g id="title"></g></svg>',
  );

  expectEngineError(
    () => validateSvg(doubleQuotedDuplicateSvg, section),
    ["duplicate", "svg", "id"],
  );

  const singleQuotedDuplicateSvg = svg.replace(
    "</svg>",
    "<g id='title'></g></svg>",
  );

  expectEngineError(
    () => validateSvg(singleQuotedDuplicateSvg, section),
    ["duplicate", "svg", "id"],
  );
});
