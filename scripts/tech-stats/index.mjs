import {
  existsSync,
  mkdirSync,
  readFileSync,
  readdirSync,
  realpathSync,
  renameSync,
  writeFileSync,
} from "node:fs";
import path from "node:path";
import os from "node:os";
import { fileURLToPath } from "node:url";
import { analyze, githubClient, summarize } from "./analyze.mjs";
import { assertPrivateOutputAbsent, render, validateSvg } from "./render.mjs";

export const root = fileURLToPath(new URL("../../", import.meta.url));
export const definitionsDirectory = path.join(
  root,
  "scripts/tech-stats/definitions",
);
export const iconDirectory = path.join(root, "assets/tech-stats/icons");
export const statisticsDirectory = path.join(
  root,
  "assets/tech-stats/statistics",
);
export function loadConfiguration() {
  const publicConfig = JSON.parse(
    readFileSync(new URL("./config.json", import.meta.url), "utf8"),
  );
  const config = structuredClone(publicConfig);
  // This Actions variable (or local environment value) stays out of public configuration and logs.
  const override = JSON.parse(process.env.TECH_STATS_REPOSITORIES || "{}");
  for (const key of ["include", "exclude"]) {
    if (override[key] !== undefined) config[key] = override[key];
    if (
      !Array.isArray(config[key]) ||
      config[key].some(
        (name) => typeof name !== "string" || !/^[\w.-]+\/[\w.-]+$/.test(name),
      )
    )
      throw new Error("Invalid repository selection.");
  }
  const sections = readdirSync(definitionsDirectory)
    .filter((name) => name.endsWith(".json"))
    .sort()
    .map((name) =>
      JSON.parse(readFileSync(path.join(definitionsDirectory, name), "utf8")),
    );
  const ids = new Set();
  for (const section of sections) {
    if (!/^[a-z-]+$/.test(section.id) || !Array.isArray(section.technologies))
      throw new Error("Invalid section configuration.");
    for (const tech of section.technologies) {
      if (
        ids.has(tech.id) ||
        !["language", "adoption", "curated"].includes(tech.metric)
      )
        throw new Error("Invalid technology configuration.");
      ids.add(tech.id);
    }
  }
  return { config, publicConfig, sections };
}

export function privateReportPath(filename) {
  const target = path.resolve(filename);
  // Resolve existing parents to prevent writing through a symlink back into the checkout.
  const parent = realpathSync(path.dirname(target));
  const relative = path.relative(
    realpathSync(root),
    existsSync(target)
      ? realpathSync(target)
      : path.join(parent, path.basename(target)),
  );
  if (
    !relative ||
    (!relative.startsWith(`..${path.sep}`) &&
      relative !== ".." &&
      !path.isAbsolute(relative))
  ) {
    throw new Error("Private reports must be stored outside the repository.");
  }
  return target;
}

export function generate(report, sections, config, publicConfig) {
  const summary = summarize(report.repositories, sections);
  const outputs = Object.fromEntries(
    sections.map((section) => {
      const svg = render(section, summary, config, iconDirectory);
      validateSvg(svg, section);
      return [`${section.id}.svg`, svg];
    }),
  );
  const publicInputs = [
    JSON.stringify(publicConfig),
    JSON.stringify(sections),
    ...readdirSync(iconDirectory).map((name) =>
      readFileSync(path.join(iconDirectory, name), "utf8"),
    ),
  ];
  const privateNames = [
    ...new Set([
      ...report.privateNames,
      ...report.selection
        .filter((repo) => repo.private)
        .map((repo) => repo.name),
    ]),
  ];
  assertPrivateOutputAbsent(
    [...Object.values(outputs), ...publicInputs],
    privateNames,
    [process.env.TECH_STATS_TOKEN],
  );
  return { outputs, summary };
}

function main() {
  const args = process.argv.slice(2);
  const mode = args[0];
  if (!["analyze", "render", "update"].includes(mode))
    throw new Error(
      "Usage: node scripts/tech-stats/index.mjs analyze|render|update [--local-gh] [--report <external-file>] [--output <directory>]",
    );
  const option = (name, fallback) => {
    const index = args.indexOf(name);
    if (index < 0) return fallback;
    if (!args[index + 1] || args[index + 1].startsWith("--"))
      throw new Error("Missing option value.");
    return args[index + 1];
  };
  const { config, publicConfig, sections } = loadConfiguration();
  let report;
  if (mode === "render") {
    const filename = privateReportPath(
      option(
        "--report",
        path.join(os.tmpdir(), "tech-stats-private-report.json"),
      ),
    );
    report = JSON.parse(readFileSync(filename, "utf8"));
  } else {
    report = analyze(
      githubClient({ localGh: args.includes("--local-gh") }),
      config,
      sections,
    );
    if (mode === "analyze" || args.includes("--report")) {
      if (process.env.GITHUB_ACTIONS)
        throw new Error(
          "Persistent private audit reports are disabled in Actions.",
        );
      const filename = privateReportPath(
        option(
          "--report",
          path.join(os.tmpdir(), "tech-stats-private-report.json"),
        ),
      );
      writeFileSync(filename, `${JSON.stringify(report, null, 2)}\n`, {
        mode: 0o600,
      });
    }
  }
  if (mode === "analyze") {
    console.log(
      JSON.stringify(
        {
          included: report.includedCount,
          excluded: report.excludedCount,
          summary: report.summary,
        },
        null,
        2,
      ),
    );
    return;
  }
  const { outputs, summary } = generate(report, sections, config, publicConfig);
  const target = path.resolve(option("--output", statisticsDirectory));
  mkdirSync(target, { recursive: true });
  // All sections and the privacy scan succeed before replacing any final SVG.
  for (const [name, svg] of Object.entries(outputs)) {
    const temporary = path.join(target, `${name}.tmp`);
    writeFileSync(temporary, svg);
    renameSync(temporary, path.join(target, name));
  }
  console.log(
    `Validated ${Object.keys(outputs).length} SVGs from ${summary.analyzedRepositories} repositories. No identifying repository data written to public output.`,
  );
}

if (
  process.argv[1] &&
  fileURLToPath(import.meta.url) === path.resolve(process.argv[1])
) {
  try {
    main();
  } catch {
    // Never expose exception messages/stacks from repository JSON, paths, source or GitHub responses.
    console.error(
      "Technology statistics failed. No partial analysis is accepted. Check credentials, configuration, evidence limits, input validity, and privacy checks locally.",
    );
    process.exitCode = 1;
  }
}
