// 📦 Imports
import {
  mkdirSync,
  readFileSync,
  readdirSync,
  renameSync,
  unlinkSync,
  writeFileSync,
} from "node:fs";
import path from "node:path";

// 🧠 Engine
import { ENGINE_ROOT } from "@constants/paths.js";
import { GENERATED_OUTPUT_FILENAME_PATTERN } from "@constants/output.js";
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

  const expectedFilenames = new Set(Object.keys(outputs));

  // Validate every filename generated from the current definitions
  for (const filename of expectedFilenames) {
    if (!GENERATED_OUTPUT_FILENAME_PATTERN.test(filename)) {
      throw new Error("🔊 Invalid generated output filename.");
    }
  }

  // Persist the complete current set of generated statistics
  for (const [filename, svg] of Object.entries(outputs)) {
    const finalPath = path.join(targetDirectory, filename);
    const temporaryPath = `${finalPath}.tmp`;

    writeFileSync(temporaryPath, svg, "utf8");
    renameSync(temporaryPath, finalPath);
  }

  // Remove SVGs that no longer correspond to a current definition
  for (const filename of readdirSync(targetDirectory)) {
    if (filename.endsWith(".svg") && !expectedFilenames.has(filename)) {
      unlinkSync(path.join(targetDirectory, filename));
    }
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
   * Use the aggregate metrics already calculated during analysis.
   * Rendering does not recalculate statistics from repository evidence.
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
