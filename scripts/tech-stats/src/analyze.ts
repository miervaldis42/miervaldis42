// 🧠 Engine
import { detect, isEvidenceFile } from "@/detect.js";
import { readRepoTree } from "@/github.js";
import { calculateMetrics } from "@/metrics.js";
import { buildAnalysisReport } from "@/report.js";

// 🏷️ Types
import type {
  AnalyzedRepository,
  SelectedRepository,
} from "@customTypes/analysis.js";
import type { LoadedConfig } from "@customTypes/config.js";
import type { EvidenceFiles } from "@customTypes/detection.js";
import type {
  GitBlobResponse,
  GitHubClient,
  GitHubLanguages,
  GitHubRepository,
} from "@customTypes/github.js";
import type { AnalysisReport } from "@customTypes/report.js";

/*
 * 🗂️ Repository Selection
 */

/**
 * @description Applies repository ownership, fork, archive, profile-repository
 * and explicit include/exclude rules to discovered GitHub repositories.
 *
 * Repositories are preserved in the returned collection even when excluded so
 * the private analysis report can explain why they were not analyzed.
 *
 * @param repositories - Repositories discovered through GitHub.
 * @param config - Validated repository-selection settings.
 * @returns Repositories annotated with their inclusion or exclusion reason.
 */
function selectRepositories(
  repositories: GitHubRepository[],
  config: LoadedConfig["repository"],
): SelectedRepository[] {
  const owner = config.owner.toLowerCase();

  const include = new Set(config.include.map((name) => name.toLowerCase()));

  const exclude = new Set(config.exclude.map((name) => name.toLowerCase()));

  return repositories.map((repository) => {
    const name = repository.full_name.toLowerCase();

    const reason =
      repository.owner.login.toLowerCase() !== owner
        ? "other owner"
        : repository.fork
          ? "fork"
          : repository.archived
            ? "archived"
            : name === `${owner}/${owner}`
              ? "profile repository"
              : exclude.has(name)
                ? "explicit exclusion"
                : include.size > 0 && !include.has(name)
                  ? "outside inclusion list"
                  : null;

    return {
      ...repository,
      reason,
    };
  });
}

/*
 * 📥 Repository Evidence
 */

/**
 * @description Downloads only repository files whose contents are required by
 * technology detection while enforcing the configured evidence limits.
 *
 * @param api - GitHub API client.
 * @param repository - Repository currently being analyzed.
 * @param entries - Eligible checked-in files from the repository Git tree.
 * @param config - Validated analysis settings.
 * @returns Evidence file contents keyed by repository-relative path.
 */
function downloadEvidenceFiles(
  api: GitHubClient,
  repository: GitHubRepository,
  entries: ReturnType<typeof readRepoTree>,
  config: LoadedConfig["analysis"],
): EvidenceFiles {
  const candidates = entries.filter((entry) => isEvidenceFile(entry.path));

  const hasOversizedTreeEntry = candidates.some(
    (entry) =>
      typeof entry.size === "number" && entry.size > config.maxEvidenceBytes,
  );

  if (candidates.length > config.maxEvidenceFiles || hasOversizedTreeEntry) {
    throw new Error(
      "🔊 Repository evidence exceeds configured bounds; refusing partial statistics.",
    );
  }

  const files: EvidenceFiles = {};

  for (const entry of candidates) {
    const blob = api<GitBlobResponse>(
      `repos/${repository.full_name}/git/blobs/${entry.sha}`,
    );

    if (blob.encoding !== "base64" || blob.size > config.maxEvidenceBytes) {
      throw new Error("🔊 Unsupported or oversized evidence blob.");
    }

    files[entry.path] = Buffer.from(blob.content, "base64").toString("utf8");
  }

  return files;
}

/*
 * 🔎 Repository Analysis
 */

/**
 * @description Collects language usage and technology evidence for one selected
 * repository.
 *
 * @param api - GitHub API client.
 * @param repository - Repository selected for analysis.
 * @param config - Trusted Technology Statistics configuration.
 * @returns Repository-level analysis data used by metrics and the private report.
 */
function analyzeRepository(
  api: GitHubClient,
  repository: SelectedRepository,
  config: LoadedConfig,
): AnalyzedRepository {
  const languages = api<GitHubLanguages>(
    `repos/${repository.full_name}/languages`,
  );

  const entries = readRepoTree(api, repository, config.analysis);

  const files = downloadEvidenceFiles(
    api,
    repository,
    entries,
    config.analysis,
  );

  return {
    name: repository.full_name,
    private: repository.private,
    defaultBranch: repository.default_branch,
    languages,
    evidence: detect(
      entries.map((entry) => entry.path),
      files,
      config.detectionRules,
    ),
  };
}

/*
 * 🚪 Public API
 */

/**
 * Main Orchestrator
 *
 * @description Runs one complete Technology Statistics analysis from GitHub
 * repository discovery through private report construction.
 *
 * @param api - GitHub API client.
 * @param config - Trusted configuration produced by loadConfig().
 * @returns The complete private analysis report.
 */
function analyze(api: GitHubClient, config: LoadedConfig): AnalysisReport {
  /*
   * Analysis flow:
   * 1. Discover public and authorized repositories owned by the configured user.
   * 2. Deduplicate and classify repositories through selection rules.
   * 3. Analyze every included repository.
   * 4. Calculate configured Technology Statistics metrics.
   * 5. Build the private analysis report.
   */

  // 1. Discover repositories visible through public and authenticated GitHub APIs
  const publicRepositories = api<GitHubRepository[][]>(
    `users/${encodeURIComponent(config.repository.owner)}/repos?type=owner&per_page=100`,
    { paginate: true },
  ).flat();

  const accessibleRepositories = api<GitHubRepository[][]>(
    "user/repos?affiliation=owner&visibility=all&per_page=100",
    { paginate: true },
  ).flat();

  // 2. Deduplicate repositories before applying selection rules
  const uniqueRepositories = new Map(
    [...publicRepositories, ...accessibleRepositories].map((repository) => [
      repository.full_name.toLowerCase(),
      repository,
    ]),
  );

  const selection = selectRepositories(
    [...uniqueRepositories.values()],
    config.repository,
  ).sort((left, right) => left.full_name.localeCompare(right.full_name));

  // 3. Analyze repositories that passed selection
  const repositories = selection
    .filter((repository) => repository.reason === null)
    .map((repository) => analyzeRepository(api, repository, config));

  // 4. Calculate configured statistics from repository analysis
  const summary = calculateMetrics(repositories, config.definitions);

  // 5. Assemble the private analysis report
  return buildAnalysisReport(selection, repositories, summary);
}

export { analyze, selectRepositories };
