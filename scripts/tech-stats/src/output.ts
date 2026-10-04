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

// ⚙️ Engine
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
      throw new Error(
        "🔊 The public output privacy check failed because credential material was detected. Generation stopped to prevent publishing a secret.",
      );
    }

    for (const value of forbidden) {
      const escaped = value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

      const encoded = encodeURIComponent(value).toLowerCase();

      if (
        new RegExp(`(?<![a-z0-9_-])${escaped}(?![a-z0-9_-])`, "i").test(text) ||
        (encoded !== value.toLowerCase() && text.includes(encoded))
      ) {
        throw new Error(
          "🔊 The public output privacy check failed because an output contains a protected repository identifier. Details are hidden to avoid exposing private repository information.",
        );
      }
    }
  }
}

/**
 * @description Reads public engine input files so their contents can be included
 * in the public-output privacy check.
 *
 * Directories are processed in the provided order, while files inside each
 * directory are read in deterministic filename order.
 *
 * @param directories - Directories containing public engine inputs.
 * @returns The text contents of every direct file found in those directories.
 */
function readPublicInputs(directories: string[]): string[] {
  try {
    return directories.flatMap((directory) =>
      readdirSync(directory, {
        withFileTypes: true,
      })
        .filter((entry) => entry.isFile())
        .sort((left, right) => left.name.localeCompare(right.name))
        .map((entry) => readFileSync(path.join(directory, entry.name), "utf8")),
    );
  } catch {
    throw new Error(
      "🔊 Public inputs could not be read for the privacy check. Check that the configured public directories & files exist and can be accessed.",
    );
  }
}

/*
 * 💾 Output Persistence
 */

function writeGeneratedOutputs(
  outputs: GeneratedOutputs,
  targetDirectory: string,
): void {
  const expectedFilenames = new Set(Object.keys(outputs));

  // Validate every filename before changing the output directory
  for (const filename of expectedFilenames) {
    if (!GENERATED_OUTPUT_FILENAME_PATTERN.test(filename)) {
      throw new Error(
        `🔊 The generated output filename \`${filename}\` is invalid. Use lowercase letters, numbers & hyphens followed by \`.svg\`.`,
      );
    }
  }

  try {
    mkdirSync(targetDirectory, {
      recursive: true,
    });

    // Persist the complete current set of generated statistics
    for (const [filename, svg] of Object.entries(outputs)) {
      const finalPath = path.join(targetDirectory, filename);
      const temporaryPath = `${finalPath}.tmp`;

      writeFileSync(temporaryPath, svg, "utf8");
      renameSync(temporaryPath, finalPath);
    }

    // Remove obsolete generated SVGs & temporary files left by interrupted writes
    for (const filename of readdirSync(targetDirectory)) {
      const isObsoleteSvg =
        filename.endsWith(".svg") && !expectedFilenames.has(filename);

      const isTemporaryGeneratedOutput =
        filename.endsWith(".tmp") &&
        GENERATED_OUTPUT_FILENAME_PATTERN.test(
          filename.slice(0, -".tmp".length),
        );

      if (isObsoleteSvg || isTemporaryGeneratedOutput) {
        unlinkSync(path.join(targetDirectory, filename));
      }
    }
  } catch {
    throw new Error(
      "🔊 Generated outputs could not be saved. Check that the output directory exists or can be created & that it is writable.",
    );
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
