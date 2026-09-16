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

function getTechnologyMetric(
  technology: TechnologyDefinition,
  summary: AnalysisSummary,
): TechnologyMetric {
  const metric = summary.metrics[technology.id];

  if (!metric || metric.metric !== technology.metric) {
    throw new Error("🔊 Missing or mismatched technology metric.");
  }

  return metric;
}

/*
 * 🖼️ SVG Icons
 */

/**
 * @description Reads a local SVG icon, validates that it contains only local
 * vector geometry and namespaces internal IDs before embedding it.
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
    throw new Error("🔊 Invalid icon filename.");
  }

  const source = readFileSync(
    path.join(iconDirectory, filename),
    "utf8",
  ).trim();

  const match = source.match(/<svg\b([^>]*)>([\s\S]*)<\/svg>\s*$/);

  const attributes = match?.[1];
  const bodySource = match?.[2];

  const viewBox = attributes?.match(/viewBox="([^"]+)"/)?.[1];

  if (
    !attributes ||
    bodySource === undefined ||
    !viewBox ||
    /<(?:script|image|foreignObject|style)\b|\bon\w+\s*=|(?:href\s*=\s*["'](?!#))|url\(\s*["']?(?!#)[^"')\s]/i.test(
      source,
    )
  ) {
    throw new Error("🔊 Icon must contain only local vector geometry.");
  }

  let body = bodySource;

  /*
   * Namespace IDs, including gradient & clip references, so repeated icons
   * and light/dark theme variants cannot collide in the generated SVG.
   */
  const ids = [...body.matchAll(/\bid="([^"]+)"/g)]
    .map((item) => item[1])
    .filter((id): id is string => Boolean(id));

  for (const id of ids) {
    body = body
      .replaceAll(`id="${id}"`, `id="${prefix}-${id}"`)
      .replaceAll(`url(#${id})`, `url(#${prefix}-${id})`)
      .replaceAll(`href="#${id}"`, `href="#${prefix}-${id}"`);
  }

  const rootFill = attributes.match(/\bfill="([^"]+)"/)?.[1];

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
      throw new Error("🔊 Invalid layout value.");
    }
  }

  if (
    !Number.isInteger(layout.maxCardsPerRow) ||
    layout.maxCardsPerRow < 1 ||
    layout.cardWidth < layout.pillWidth ||
    layout.cardWidth < layout.iconSize
  ) {
    throw new Error("🔊 Invalid card dimensions.");
  }

  const rows = Math.ceil(section.technologies.length / layout.maxCardsPerRow);

  if (!rows) {
    throw new Error("🔊 A section must have cards.");
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

    return `  <g class="card" transform="translate(${center} ${row * (rowHeight + layout.rowGap)})">
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

  const metricExplanation = section.technologies.some(
    (technology) => technology.metric === "language",
  )
    ? "Language percentages use the configured language statistics as their denominator."
    : "Percentages measure independent repository adoption; Curated is not measured.";

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" role="img" aria-labelledby="title description">
  <title id="title">${escapeXml(section.title)}</title>
  <desc id="description">${escapeXml(description)}. ${metricExplanation} Code statistics, not proficiency.</desc>
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
  if (
    /<(?:script|image|foreignObject)\b|\bon\w+\s*=|(?:href\s*=\s*["'](?!#))/i.test(
      svg,
    )
  ) {
    throw new Error("🔊 Unsafe SVG content.");
  }

  const cardCount = svg.match(/class="card"/g)?.length ?? 0;

  if (cardCount !== section.technologies.length) {
    throw new Error("🔊 SVG card count mismatch.");
  }

  if (
    !svg.includes("viewBox=") ||
    !svg.includes("@media (prefers-color-scheme: dark)")
  ) {
    throw new Error("🔊 SVG is missing sizing or theme rules.");
  }

  const ids = [...svg.matchAll(/\bid="([^"]+)"/g)]
    .map((match) => match[1])
    .filter((id): id is string => Boolean(id));

  if (new Set(ids).size !== ids.length) {
    throw new Error("🔊 Duplicate SVG IDs.");
  }

  for (const technology of section.technologies) {
    if (
      technology.icons !== undefined &&
      (!svg.includes(`${technology.id}-light`) ||
        !svg.includes(`${technology.id}-dark`))
    ) {
      throw new Error("🔊 Theme variant missing.");
    }
  }
}

export { embedIcon, renderStatisticsSection, validateSvg };
