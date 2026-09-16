// 📦 Imports
import {
  chmodSync,
  lstatSync,
  mkdirSync,
  realpathSync,
  writeFileSync,
} from "node:fs";
import os from "node:os";
import path from "node:path";

// 📍 Engine Paths
import { REPOSITORY_ROOT } from "@constants/paths.js";

// 🏷️ Types
import type {
  AnalysisSummary,
  AnalyzedRepository,
  SelectedRepository,
} from "@customTypes/analysis.js";
import type { AnalysisReport } from "@customTypes/report.js";

/*
 * 🧾 Analysis Report
 */

function buildAnalysisReport(
  selection: SelectedRepository[],
  repositories: AnalyzedRepository[],
  summary: AnalysisSummary,
): AnalysisReport {
  const privateRepositoryNames = [
    ...new Set(
      selection
        .filter((repository) => repository.private)
        .map((repository) => repository.full_name.toLowerCase()),
    ),
  ];

  return {
    schemaVersion: 1,
    timestamp: new Date().toISOString(),
    includedRepositoryCount: repositories.length,
    excludedRepositoryCount: selection.filter(
      (repository) => repository.reason !== null,
    ).length,
    selection: selection.map((repository) => ({
      name: repository.full_name,
      private: repository.private,
      reason: repository.reason,
    })),
    privateRepositoryNames,
    repositories,
    summary,
  };
}

/*
 * 📍 Report Path
 */

function getDefaultReportPath(): string {
  return path.join(
    os.homedir(),
    "tech-stats-reports",
    "tech-stats-report.json",
  );
}

/**
 * @description Validates that a private report path is outside the repository.
 *
 * This guard prevents writes to locations within the current Git working tree,
 * including symlinked destinations, to keep private audit reports from being
 * stored in the repository itself.
 *
 * @param filename - The target report path to validate.
 * @returns The absolute path if it is safely outside the repository.
 */
function resolvePrivateReportPath(filename: string): string {
  // Convert into an absolute path
  const target = path.resolve(filename);

  // Reject symbolic-link destinations, including dangling file symlinks
  const targetEntry = lstatSync(target, {
    throwIfNoEntry: false,
  });

  if (targetEntry?.isSymbolicLink()) {
    throw new Error(
      "🔊 Private reports must be stored outside the repository.",
    );
  }

  // Expose the real repository path identity
  const repositoryRoot = realpathSync(REPOSITORY_ROOT);

  /*
   * Resolve the nearest existing ancestor without creating directories.
   *
   * Missing path segments are then appended to that real location so the
   * engine can determine where the report would actually be written.
   */
  let existingAncestor = path.dirname(target);

  const missingSegments = [path.basename(target)];

  while (
    lstatSync(existingAncestor, {
      throwIfNoEntry: false,
    }) === undefined
  ) {
    const parent = path.dirname(existingAncestor);

    if (parent === existingAncestor) {
      throw new Error(
        "🔊 There was an issue preparing the report path, so the report cannot be saved at the indicated location.",
      );
    }

    missingSegments.unshift(path.basename(existingAncestor));

    existingAncestor = parent;
  }

  const resolvedTarget = path.join(
    realpathSync(existingAncestor),
    ...missingSegments,
  );

  // Calculate the target location relative to the repository root
  const relative = path.relative(repositoryRoot, resolvedTarget);

  // Check if the path is outside of the current repository
  const isOutsideRepository =
    relative === ".." ||
    relative.startsWith(`..${path.sep}`) ||
    path.isAbsolute(relative);

  if (!relative || !isOutsideRepository) {
    throw new Error(
      "🔊 Private reports must be stored outside the repository.",
    );
  }

  // Return the absolute path which can be used to write the report in
  return target;
}

/*
 * 💾 Report Persistence
 */

function writePrivateReport(
  report: AnalysisReport,
  filename = getDefaultReportPath(),
): string {
  // Check if the process is triggered by a GitHub Action
  // Stop the report generation if it is the case
  if (process.env.GITHUB_ACTIONS) {
    throw new Error(
      "🔊 Private analysis reports are not written during GitHub Actions runs because they may contain repository-level information. Run the analysis locally to generate a report.",
    );
  }

  // Verify the report destination before modifying the filesystem
  const verifiedFilePath = resolvePrivateReportPath(filename);

  // Create the verified report directory if needed
  mkdirSync(path.dirname(verifiedFilePath), {
    recursive: true,
  });

  // Write the report at a verified path
  writeFileSync(verifiedFilePath, `${JSON.stringify(report, null, 2)}\n`, {
    encoding: "utf8",
    mode: 0o600,
  });

  // Enforce private report permissions when supported by the platform
  if (process.platform !== "win32") {
    chmodSync(verifiedFilePath, 0o600);
  }

  return verifiedFilePath;
}

export { buildAnalysisReport, writePrivateReport };
