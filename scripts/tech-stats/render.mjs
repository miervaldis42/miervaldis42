import { readFileSync } from 'node:fs';
import path from 'node:path';

const xml = (value) => String(value).replace(/[&<>"']/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&apos;' })[char]);

export function embedIcon(filename, iconDirectory, prefix, size, y) {
  if (!/^[a-z0-9-]+\.svg$/.test(filename)) throw new Error('Invalid icon filename.');
  let source = readFileSync(path.join(iconDirectory, filename), 'utf8').trim();
  const match = source.match(/<svg\b([^>]*)>([\s\S]*)<\/svg>\s*$/);
  const viewBox = match?.[1].match(/viewBox="([^"]+)"/)?.[1];
  if (!viewBox || /<(?:script|image|foreignObject|style)\b|\bon\w+\s*=|(?:href\s*=\s*["'](?!#))|url\(\s*["']?(?!#)[^"')\s]/i.test(source)) {
    throw new Error('Icon must contain only local vector geometry.');
  }
  let body = match[2];
  // Namespace IDs, including gradient and clip references, across repeated icons and theme variants.
  const ids = [...body.matchAll(/\bid="([^"]+)"/g)].map((item) => item[1]);
  for (const id of ids) {
    body = body.replaceAll(`id="${id}"`, `id="${prefix}-${id}"`)
      .replaceAll(`url(#${id})`, `url(#${prefix}-${id})`)
      .replaceAll(`href="#${id}"`, `href="#${prefix}-${id}"`);
  }
  const rootFill = match[1].match(/\bfill="([^"]+)"/)?.[1];
  return `<svg x="${-size / 2}" y="${y}" width="${size}" height="${size}" viewBox="${xml(viewBox)}"${rootFill ? ` fill="${xml(rootFill)}"` : ''} aria-hidden="true">${body}</svg>`;
}

export function render(section, summary, config, iconDirectory) {
  const l = config.layout;
  for (const value of Object.values(l)) if (!Number.isFinite(value) || value < 0) throw new Error('Invalid layout value.');
  if (!Number.isInteger(l.maxCardsPerRow) || l.maxCardsPerRow < 1 || l.cardWidth < l.pillWidth || l.cardWidth < l.iconSize) throw new Error('Invalid card dimensions.');
  const rows = Math.ceil(section.technologies.length / l.maxCardsPerRow);
  if (!rows) throw new Error('A section must have cards.');
  const columns = Math.ceil(section.technologies.length / rows);
  const width = l.canvasWidth;
  const requiredWidth = 2 * l.outerHorizontalPadding + columns * l.cardWidth + (columns - 1) * l.cardGap;
  if (!Number.isFinite(width) || width < requiredWidth) throw new Error('Cards do not fit the configured canvas width.');
  const nameY = l.outerVerticalPadding + l.iconSize + l.iconNameGap;
  const pillY = nameY + l.namePillGap;
  const rowHeight = pillY + l.pillHeight + l.outerVerticalPadding;
  const height = rows * rowHeight + (rows - 1) * l.rowGap;
  const cards = section.technologies.map((tech, index) => {
    const metric = summary.metrics[tech.id];
    if (!metric || metric.metric !== tech.metric) throw new Error('Missing or mismatched technology metric.');
    const row = Math.floor(index / columns);
    const rowCount = Math.min(columns, section.technologies.length - row * columns);
    const rowWidth = rowCount * l.cardWidth + (rowCount - 1) * l.cardGap;
    const center = (width - rowWidth) / 2 + l.cardWidth / 2 + (index % columns) * (l.cardWidth + l.cardGap);
    const icon = tech.icons
      ? `<g id="${tech.id}-light-variant" class="theme-light-only">${embedIcon(tech.icons.light, iconDirectory, `${tech.id}-light`, l.iconSize, l.outerVerticalPadding)}</g>\n    <g id="${tech.id}-dark-variant" class="theme-dark-only">${embedIcon(tech.icons.dark, iconDirectory, `${tech.id}-dark`, l.iconSize, l.outerVerticalPadding)}</g>`
      : embedIcon(tech.icon, iconDirectory, tech.id, l.iconSize, l.outerVerticalPadding);
    const detail = tech.metric === 'language' ? `${metric.numerator} of ${metric.denominator} relevant Linguist bytes`
      : tech.metric === 'adoption' ? `detected in ${metric.numerator} of ${metric.denominator} analyzed repositories` : 'curated technology; not a measured statistic';
    return `  <g class="card" transform="translate(${center} ${row * (rowHeight + l.rowGap)})">
    <title>${xml(tech.name)}: ${xml(metric.label)}; ${xml(detail)}</title>
    ${icon}
    <text class="name" x="0" y="${nameY}">${xml(tech.name)}</text>
    <rect class="pill" x="${-l.pillWidth / 2}" y="${pillY}" width="${l.pillWidth}" height="${l.pillHeight}" rx="${l.pillHeight / 2}"/>
    <text class="statistic" x="0" y="${pillY + l.pillTextBaseline}">${xml(metric.label)}</text>
  </g>`;
  });
  const { light, dark } = config.colors;
  const description = section.technologies.map((tech) => `${tech.name}: ${summary.metrics[tech.id].label}`).join('; ');
  return `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 ${width} ${height}" role="img" aria-labelledby="title description">
  <title id="title">${xml(section.title)}</title>
  <desc id="description">${xml(description)}. ${section.technologies.some((tech) => tech.metric === 'language') ? 'Language share among TypeScript, JavaScript, HTML, and CSS.' : 'Percentages measure independent repository adoption; Curated is not measured.'} Code statistics, not proficiency.</desc>
  <!-- Local icon provenance and license notices: ../icons/SOURCES.md.
       HTML5 Logo by W3C: https://www.w3.org/html/logo/ (CC BY 3.0).
       Husky illustration: Twemoji, Twitter and contributors (CC BY 4.0).
       Devicon artwork: MIT; see ../icons/DEVICON-LICENSE. -->
  <style>
    .name, .statistic { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif; text-anchor: middle; }
    .name { fill: ${light.text}; font-size: ${l.nameFontSize}px; font-weight: 600; }
    .pill { fill: ${light.pill}; }
    .statistic { fill: ${light.statistic}; font-size: ${l.statisticFontSize}px; font-weight: 600; font-variant-numeric: tabular-nums; }
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
${cards.join('\n')}
</svg>
`;
}

export function validateSvg(svg, section) {
  if (/<(?:script|image|foreignObject)\b|\bon\w+\s*=|(?:href\s*=\s*["'](?!#))/i.test(svg)) throw new Error('Unsafe SVG content.');
  if ((svg.match(/class="card"/g) ?? []).length !== section.technologies.length) throw new Error('SVG card count mismatch.');
  if (!svg.includes('viewBox=') || !svg.includes('@media (prefers-color-scheme: dark)')) throw new Error('SVG is missing sizing or theme rules.');
  const ids = [...svg.matchAll(/\bid="([^"]+)"/g)].map((match) => match[1]);
  if (new Set(ids).size !== ids.length) throw new Error('Duplicate SVG IDs.');
  for (const tech of section.technologies.filter((item) => item.icons)) {
    if (!svg.includes(`${tech.id}-light`) || !svg.includes(`${tech.id}-dark`)) throw new Error('Theme variant missing.');
  }
}

export function assertPrivateOutputAbsent(outputs, privateNames, secrets = []) {
  const forbidden = privateNames.flatMap((name) => [name, name.split('/').at(-1)]);
  for (const output of outputs) {
    const text = output.toLowerCase();
    if (secrets.filter(Boolean).some((secret) => text.includes(secret.toLowerCase()) || text.includes(encodeURIComponent(secret).toLowerCase()))) {
      throw new Error('Privacy check failed; credential material detected.');
    }
    for (const value of forbidden) {
      const escaped = value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const encoded = encodeURIComponent(value).toLowerCase();
      if (new RegExp(`(?<![a-z0-9_-])${escaped}(?![a-z0-9_-])`, 'i').test(text)
          || (encoded !== value.toLowerCase() && text.includes(encoded))) {
        throw new Error('Privacy check failed; an output contains a protected identifier. Details suppressed.');
      }
    }
  }
}
