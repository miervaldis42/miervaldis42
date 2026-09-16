// 📦 Imports
import {
  mkdirSync,
  readFileSync,
  readdirSync,
  renameSync,
  writeFileSync,
} from "node:fs";
import path from "node:path";

// 🧠 Engine
import { ENGINE_ROOT } from "@constants/paths.js";
import { renderStatisticsSection, validateSvg } from "@/render.js";

// 🏷️ Types
import type { GeneratedOutputs } from "@customTypes/output.js";
import type { AnalysisReport } from "@customTypes/report.js";
import type { LoadedConfig } from "@customTypes/config.js";

/*
 * 🔐 Public Output Privacy
 */

function assertPrivateOutputAbsent(
  outputs: string[],
  privateNames: string[],
  secrets: Array<string | undefined> = [],
): void {
  const forbidden = privateNames.flatMap((name) => [
    name,
    name.split("/").at(-1) ?? name,
  ]);

  const protectedSecrets = secrets.filter((secret): secret is string =>
    Boolean(secret),
  );

  for (const output of outputs) {
    const text = output.toLowerCase();

    if (
      protectedSecrets.some((secret) => {
        const normalizedSecret = secret.toLowerCase();

        const encodedSecret = encodeURIComponent(secret).toLowerCase();

        return text.includes(normalizedSecret) || text.includes(encodedSecret);
      })
    ) {
      throw new Error("🔊 Privacy check failed; credential material detected.");
    }

    for (const value of forbidden) {
      const escaped = value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

      const encoded = encodeURIComponent(value).toLowerCase();

      if (
        new RegExp(`(?<![a-z0-9_-])${escaped}(?![a-z0-9_-])`, "i").test(text) ||
        (encoded !== value.toLowerCase() && text.includes(encoded))
      ) {
        throw new Error(
          "🔊 Privacy check failed; an output contains a protected identifier. Details suppressed.",
        );
      }
    }
  }
}

function readPublicInputs(directories: string[]): string[] {
  return directories.flatMap((directory) =>
    readdirSync(directory, {
      withFileTypes: true,
    })
      .filter((entry) => entry.isFile())
      .sort((left, right) => left.name.localeCompare(right.name))
      .map((entry) => readFileSync(path.join(directory, entry.name), "utf8")),
  );
}

/*
 * 💾 Output Persistence
 */

function writeGeneratedOutputs(
  outputs: GeneratedOutputs,
  targetDirectory: string,
): void {
  mkdirSync(targetDirectory, {
    recursive: true,
  });

  for (const [filename, svg] of Object.entries(outputs)) {
    if (!/^[a-z0-9-]+\.svg$/.test(filename)) {
      throw new Error("🔊 Invalid generated output filename.");
    }

    const finalPath = path.join(targetDirectory, filename);

    const temporaryPath = `${finalPath}.tmp`;

    writeFileSync(temporaryPath, svg, "utf8");

    renameSync(temporaryPath, finalPath);
  }
}

/*
 * 🎨 Public Output Generation
 */

function generateOutputs(
  report: AnalysisReport,
  config: LoadedConfig,
): {
  outputs: GeneratedOutputs;
  analyzedRepositories: number;
} {
  /*
   * Recalculate metrics from repository-level report evidence instead of
   * trusting aggregate values persisted by an earlier run.
   */
  const summary = report.summary;
  const outputs: GeneratedOutputs = {};
  for (const section of config.definitions) {
    const svg = renderStatisticsSection(
      section,
      summary,
      config.rendering,
      config.resolvedPaths.icons,
    );

    validateSvg(svg, section);

    outputs[`${section.id}.svg`] = svg;
  }

  const publicInputs = readPublicInputs([
    path.join(ENGINE_ROOT, "config"),
    config.resolvedPaths.definitions,
    config.resolvedPaths.icons,
  ]);

  const privateNames = [
    ...new Set([
      ...report.privateRepositoryNames,
      ...report.selection
        .filter((repository) => repository.private)
        .map((repository) => repository.name),
    ]),
  ];

  assertPrivateOutputAbsent(
    [...Object.values(outputs), ...publicInputs],
    privateNames,
    [process.env.TECH_STATS_TOKEN],
  );

  return {
    outputs,
    analyzedRepositories: summary.analyzedRepositories,
  };
}

export {
  assertPrivateOutputAbsent,
  readPublicInputs,
  writeGeneratedOutputs,
  generateOutputs,
};
