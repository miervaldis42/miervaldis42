// 📦 Imports
import { existsSync, mkdirSync, realpathSync, writeFileSync } from "node:fs";
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
 * @description private-report security guard
 *
 * It checks if the given path is really outside the Git repository.
 *
 * @param filename
 * @returns
 */
function resolvePrivateReportPath(filename: string): string {
  // Convert into an absolute path
  const target = path.resolve(filename);

  // Expose the real path identity
  const parent = realpathSync(path.dirname(target));

  // Expose the real repository path identity
  const repositoryRoot = realpathSync(REPOSITORY_ROOT);

  // Get the file path if the file exists
  // Create a parent + filename path
  const resolvedTarget = existsSync(target)
    ? realpathSync(target)
    : path.join(parent, path.basename(target));

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
      "🔊 Persistent private audit reports are disabled in Actions.",
    );
  }

  // Create the report directory if needed
  mkdirSync(path.dirname(filename), {
    recursive: true,
  });

  // Write the report at a verified path
  const verifiedFilePath = resolvePrivateReportPath(filename);
  writeFileSync(verifiedFilePath, `${JSON.stringify(report, null, 2)}\n`, {
    encoding: "utf8",
    mode: 0o600,
  });

  return verifiedFilePath;
}

export { buildAnalysisReport, writePrivateReport };
