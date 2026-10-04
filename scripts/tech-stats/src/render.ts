// 📦 Imports
import { readFileSync } from "node:fs";
import path from "node:path";

// 🏷️ Types
import type {
  AnalysisSummary,
  TechnologyMetric,
} from "@customTypes/analysis.js";
import type {
  StatisticsDefinition,
  TechnologyDefinition,
} from "@customTypes/definitions.js";
import type { RenderingSettings } from "@customTypes/rendering.js";

/*
 * 🧰 Utilities
 */

// Escape dynamic text before inserting it into SVG/XML markup
function escapeXml(value: unknown): string {
  return String(value).replace(
    /[&<>"']/g,
    (character) =>
      ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&apos;",
      })[character] ?? character,
  );
}

// Read a supported quoted SVG attribute regardless of quote style
function getSvgAttribute(
  attributes: string,
  name: "viewBox" | "fill" | "id" | "class",
): string | undefined {
  const expressions = {
    viewBox: /\bviewBox\s*=\s*(["'])([^"']+)\1/,
    fill: /\bfill\s*=\s*(["'])([^"']+)\1/,
    id: /\bid\s*=\s*(["'])([^"']+)\1/,
    class: /\bclass\s*=\s*(["'])([^"']+)\1/,
  };

  return attributes.match(expressions[name])?.[2];
}

// Namespace icon IDs & their local references without repeatedly mutating them
function namespaceSvgIds(body: string, prefix: string): string {
  // Capture every original ID before rewriting anything
  // This prevents a newly namespaced ID from being mistaken for another source ID
  const ids = [...body.matchAll(/\bid\s*=\s*(["'])([^"']+)\1/g)]
    .map((match) => match[2])
    .filter((id): id is string => Boolean(id));

  // Build one stable original => namespaced mapping shared by declarations & references
  const namespacedIds = new Map(ids.map((id) => [id, `${prefix}-${id}`]));

  return (
    body
      // Rewrite the actual `id` declarations while preserving their original quote style
      .replace(
        /(\bid\s*=\s*)(["'])([^"']+)\2/g,
        (match, start: string, quote: string, id: string) => {
          const namespacedId = namespacedIds.get(id);

          return namespacedId
            ? `${start}${quote}${namespacedId}${quote}`
            : match;
        },
      )

      // Rewrite local references used by fills, gradients, masks, clips, etc...
      .replace(
        /url\(\s*(["']?)#([^"'()\s]+)\1\s*\)/gi,
        (match, quote: string, id: string) => {
          const namespacedId = namespacedIds.get(id);

          return namespacedId ? `url(${quote}#${namespacedId}${quote})` : match;
        },
      )

      // Rewrite direct local fragment references, such as `<use href="#shape">`
      .replace(
        /(\bhref\s*=\s*)(["'])#([^"']+)\2/g,
        (match, start: string, quote: string, id: string) => {
          const namespacedId = namespacedIds.get(id);

          return namespacedId
            ? `${start}${quote}#${namespacedId}${quote}`
            : match;
        },
      )
  );
}

// Detect SVG content that can execute code, animate, create links or load files from outside the SVG
function containsUnsafeSvgContent(
  source: string,
  options: {
    allowStyleElement: boolean;
  } = {
    allowStyleElement: false,
  },
): boolean {
  const forbiddenElements = options.allowStyleElement
    ? /<(?:script|image|feImage|foreignObject|a|animate|animateMotion|animateTransform|set|discard)\b/i
    : /<(?:script|image|feImage|foreignObject|style|a|animate|animateMotion|animateTransform|set|discard)\b/i;

  return (
    forbiddenElements.test(source) ||
    /\bon\w+\s*=/i.test(source) ||
    /(?:href\s*=\s*["'](?!#))/i.test(source) ||
    /url\(\s*["']?(?!#)[^"')\s]/i.test(source) ||
    /@import\b/i.test(source) ||
    /@keyframes\b/i.test(source) ||
    /\banimation\s*:/i.test(source) ||
    /\btransition\s*:/i.test(source)
  );
}

function getTechnologyMetric(
  technology: TechnologyDefinition,
  summary: AnalysisSummary,
): TechnologyMetric {
  const metric = summary.metrics[technology.id];

  if (!metric || metric.metric !== technology.metric) {
    throw new Error(
      `🔊 The metric for technology \`${technology.id}\` is missing or does not match its configured \`${technology.metric}\` metric type.`,
    );
  }

  return metric;
}

/*
 * 🖼️ SVG Icons
 */

/**
 * @description Reads a local SVG icon, verifies that it is a static,
 * self-contained drawing & namespaces internal IDs before embedding it.
 *
 * @param filename - SVG icon filename from a technology definition.
 * @param iconDirectory - Absolute directory containing trusted local icons.
 * @param prefix - Prefix used to namespace internal SVG IDs.
 * @param size - Rendered icon width & height.
 * @param y - Vertical icon position inside the generated statistic card.
 * @returns Safe SVG markup ready to embed in a generated statistics SVG.
 */
function embedIcon(
  filename: string,
  iconDirectory: string,
  prefix: string,
  size: number,
  y: number,
): string {
  if (!/^[a-z0-9-]+\.svg$/.test(filename)) {
    throw new Error(
      `🔊 The icon filename \`${filename}\` is invalid. Use lowercase letters, numbers & hyphens followed by \`.svg\`.`,
    );
  }

  let source: string;
  try {
    source = readFileSync(path.join(iconDirectory, filename), "utf8").trim();
  } catch {
    throw new Error(
      `🔊 The SVG icon \`${filename}\` could not be read. Check that the file exists in the configured icon directory & can be accessed.`,
    );
  }

  const match = source.match(/<svg\b([^>]*)>([\s\S]*)<\/svg>\s*$/);

  const attributes = match?.[1];
  const bodySource = match?.[2];

  const viewBox = attributes
    ? getSvgAttribute(attributes, "viewBox")
    : undefined;

  // Reject malformed icons, missing sizing information, active behavior & references that would load resources outside the embedded SVG itself
  if (
    !attributes ||
    bodySource === undefined ||
    !viewBox ||
    containsUnsafeSvgContent(source)
  ) {
    throw new Error(
      `🔊 The SVG icon \`${filename}\` is invalid. It must be a complete SVG with a \`viewBox\` and contain only static, self-contained drawing without scripts, animation, links or external resources.`,
    );
  }

  /*
   * Namespace IDs, including gradient, clip & local href references, so repeated
   * icons and light/dark theme variants cannot collide in the generated SVG.
   */
  const body = namespaceSvgIds(bodySource, prefix);

  const rootFill = getSvgAttribute(attributes, "fill");

  return `<svg x="${-size / 2}" y="${y}" width="${size}" height="${size}" viewBox="${escapeXml(viewBox)}"${rootFill ? ` fill="${escapeXml(rootFill)}"` : ""} aria-hidden="true">${body}</svg>`;
}

/*
 * 🎨 Statistics Rendering
 */

/**
 * @description Renders one configured Technology Statistics section as an SVG.
 *
 * The function consumes only aggregate metric results, public technology
 * definitions, rendering settings & trusted local icon assets.
 *
 * @param section - Statistics section to render.
 * @param summary - Aggregate analysis metrics.
 * @param rendering - Validated rendering configuration.
 * @param iconDirectory - Absolute directory containing local technology icons.
 * @returns Complete SVG markup for the requested statistics section.
 */
function renderStatisticsSection(
  section: StatisticsDefinition,
  summary: AnalysisSummary,
  rendering: RenderingSettings,
  iconDirectory: string,
): string {
  const layout = rendering.layout;

  for (const value of Object.values(layout)) {
    if (!Number.isFinite(value) || value < 0) {
      throw new Error(
        "🔊 The rendering layout is invalid. Every layout value must be a finite number greater than or equal to 0.",
      );
    }
  }

  if (
    !Number.isInteger(layout.maxCardsPerRow) ||
    layout.maxCardsPerRow < 1 ||
    layout.cardWidth < layout.pillWidth ||
    layout.cardWidth < layout.iconSize
  ) {
    throw new Error(
      "🔊 The card layout is invalid. `maxCardsPerRow` must be a positive integer, and `cardWidth` must be at least as wide as `pillWidth` & `iconSize`.",
    );
  }

  // Determine a balanced row layout without exceeding `maxCardsPerRow`
  // For example, 5 cards with a maximum of 4 are distributed as 3 + 2
  const rows = Math.ceil(section.technologies.length / layout.maxCardsPerRow);
  if (!rows) {
    throw new Error(
      `🔊 The statistics section \`${section.id}\` cannot be rendered because it does not contain any technologies.`,
    );
  }
  const columns = Math.ceil(section.technologies.length / rows);

  const width = layout.canvasWidth;
  const requiredWidth =
    2 * layout.outerHorizontalPadding +
    columns * layout.cardWidth +
    (columns - 1) * layout.cardGap;

  if (!Number.isFinite(width) || width < requiredWidth) {
    throw new Error("🔊 Cards do not fit the configured canvas width.");
  }

  const nameY =
    layout.outerVerticalPadding + layout.iconSize + layout.iconNameGap;
  const pillY = nameY + layout.namePillGap;

  const rowHeight = pillY + layout.pillHeight + layout.outerVerticalPadding;
  const height = rows * rowHeight + (rows - 1) * layout.rowGap;

  const cards = section.technologies.map((technology, index) => {
    const metric = getTechnologyMetric(technology, summary);

    const row = Math.floor(index / columns);

    const rowCount = Math.min(
      columns,
      section.technologies.length - row * columns,
    );

    // Calculate each row independently so shorter final rows remain centered instead of inheriting the width or starting position of a full row
    const rowWidth =
      rowCount * layout.cardWidth + (rowCount - 1) * layout.cardGap;

    const center =
      (width - rowWidth) / 2 +
      layout.cardWidth / 2 +
      (index % columns) * (layout.cardWidth + layout.cardGap);

    const icon =
      technology.icons !== undefined
        ? `<g id="${technology.id}-light-variant" class="theme-light-only">${embedIcon(
            technology.icons.light,
            iconDirectory,
            `${technology.id}-light`,
            layout.iconSize,
            layout.outerVerticalPadding,
          )}</g>
    <g id="${technology.id}-dark-variant" class="theme-dark-only">${embedIcon(
      technology.icons.dark,
      iconDirectory,
      `${technology.id}-dark`,
      layout.iconSize,
      layout.outerVerticalPadding,
    )}</g>`
        : embedIcon(
            technology.icon,
            iconDirectory,
            technology.id,
            layout.iconSize,
            layout.outerVerticalPadding,
          );

    let detail: string;

    if (metric.metric === "language") {
      detail = `${metric.numerator} of ${metric.denominator} relevant Linguist bytes`;
    } else if (metric.metric === "adoption") {
      detail = `detected in ${metric.numerator} of ${metric.denominator} analyzed repositories`;
    } else {
      detail = "curated technology; not a measured statistic";
    }

    return `<g class="card" transform="translate(${center} ${row * (rowHeight + layout.rowGap)})">
    <title>${escapeXml(technology.name)}: ${escapeXml(metric.label)}; ${escapeXml(detail)}</title>
    ${icon}
    <text class="name" x="0" y="${nameY}">${escapeXml(technology.name)}</text>
    <rect class="pill" x="${-layout.pillWidth / 2}" y="${pillY}" width="${layout.pillWidth}" height="${layout.pillHeight}" rx="${layout.pillHeight / 2}"/>
    <text class="statistic" x="0" y="${pillY + layout.pillTextBaseline}">${escapeXml(metric.label)}</text>
  </g>`;
  });

  const { light, dark } = rendering.colors;

  const description = section.technologies
    .map((technology) => {
      const metric = getTechnologyMetric(technology, summary);

      return `${technology.name}: ${metric.label}`;
    })
    .join("; ");

  // Explain every metric type used by the section instead of assuming
  // that all technologies share the same measurement method
  const metricTypes = new Set(
    section.technologies.map((technology) => technology.metric),
  );

  const metricExplanations: string[] = [];

  if (metricTypes.has("language")) {
    metricExplanations.push(
      "Language percentages are calculated from the total bytes of the selected languages across analyzed repositories. They describe code usage, not developer proficiency.",
    );
  }

  if (metricTypes.has("adoption")) {
    metricExplanations.push(
      "Adoption percentages measure how many analyzed repositories use the technology.",
    );
  }

  if (metricTypes.has("curated")) {
    metricExplanations.push(
      "Curated technologies are displayed without a measured percentage.",
    );
  }

  const metricExplanation = metricExplanations.join(" ");

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" role="img" aria-labelledby="title description">
  <title id="title">${escapeXml(section.title)}</title>
  <desc id="description">${escapeXml(description)}. ${escapeXml(metricExplanation)}</desc>
  <!-- Local icon provenance and license notices: ../icons/SOURCES.md.
       HTML5 Logo by W3C: https://www.w3.org/html/logo/ (CC BY 3.0).
       Husky illustration: Twemoji, Twitter and contributors (CC BY 4.0).
       Devicon artwork: MIT; see ../icons/DEVICON-LICENSE. -->
  <style>
    .name, .statistic { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif; text-anchor: middle; }
    .name { fill: ${light.text}; font-size: ${layout.nameFontSize}px; font-weight: 600; }
    .pill { fill: ${light.pill}; }
    .statistic { fill: ${light.statistic}; font-size: ${layout.statisticFontSize}px; font-weight: 600; font-variant-numeric: tabular-nums; }
    .theme-light-only { display: inline; }
    .theme-dark-only { display: none; }
    @media (prefers-color-scheme: dark) {
      .name { fill: ${dark.text}; }
      .pill { fill: ${dark.pill}; }
      .statistic { fill: ${dark.statistic}; }
      .theme-light-only { display: none; }
      .theme-dark-only { display: inline; }
    }
  </style>
${cards.join("\n")}
</svg>
`;
}

/*
 * ✅ SVG Validation
 */

/**
 * @description Validates one rendered Technology Statistics SVG before it can
 * be considered for public output.
 *
 * @param svg - Generated SVG markup.
 * @param section - Definition used to generate the SVG.
 */
function validateSvg(svg: string, section: StatisticsDefinition): void {
  // The final SVG may contain the renderer's own `<style>` block, but must otherwise remain static & self-contained
  if (containsUnsafeSvgContent(svg, { allowStyleElement: true })) {
    throw new Error(
      "🔊 The generated SVG contains unsafe content. It must remain static & self-contained without scripts, animation, links or external resources.",
    );
  }

  // Inspect the generated root SVG separately from its embedded icon SVGs
  const rootMatch = svg.match(/^<svg\b([^>]*)>/);
  const rootAttributes = rootMatch?.[1];

  const rootViewBox =
    rootAttributes !== undefined
      ? getSvgAttribute(rootAttributes, "viewBox")
      : undefined;

  // Extract every SVG `<g>` group so the checks below can verify real card & theme groups instead of text that only happens to contain the same words
  const groups = [...svg.matchAll(/<g\b([^>]*)>/g)].map(
    (match) => match[1] ?? "",
  );

  const cardCount = groups.filter(
    (attributes) => getSvgAttribute(attributes, "class") === "card",
  ).length;
  if (cardCount !== section.technologies.length) {
    throw new Error(
      `🔊 The generated SVG card count is ${cardCount}, but section \`${section.id}\` requires ${section.technologies.length}.`,
    );
  }

  if (!rootViewBox || !svg.includes("@media (prefers-color-scheme: dark)")) {
    throw new Error(
      "🔊 The generated SVG is missing its root `viewBox` sizing information or required dark-theme rules.",
    );
  }

  const ids = [...svg.matchAll(/\bid\s*=\s*(["'])([^"']+)\1/g)]
    .map((match) => match[2])
    .filter((id): id is string => Boolean(id));

  if (new Set(ids).size !== ids.length) {
    throw new Error("🔊 Duplicate SVG IDs.");
  }

  // Check that every technology with a light/dark icon pair has both variants in the generated SVG
  for (const technology of section.technologies) {
    if (technology.icons === undefined) {
      continue;
    }

    const hasLightVariant = groups.some(
      (attributes) =>
        getSvgAttribute(attributes, "id") ===
          `${technology.id}-light-variant` &&
        getSvgAttribute(attributes, "class") === "theme-light-only",
    );

    const hasDarkVariant = groups.some(
      (attributes) =>
        getSvgAttribute(attributes, "id") === `${technology.id}-dark-variant` &&
        getSvgAttribute(attributes, "class") === "theme-dark-only",
    );

    if (!hasLightVariant || !hasDarkVariant) {
      throw new Error(
        `🔊 The generated SVG is missing a light or dark theme variant for technology \`${technology.id}\`.`,
      );
    }
  }
}

export { embedIcon, renderStatisticsSection, validateSvg };
