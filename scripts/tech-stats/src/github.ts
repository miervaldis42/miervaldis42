// 📦 Imports
import { execFileSync } from "node:child_process";

// 🏷️ Types
import type { AnalysisSettings } from "@customTypes/config.js";
import type {
  GitHubClient,
  GitHubRepository,
  GitTreeEntry,
  GitTreeResponse,
} from "@customTypes/github.js";

/*
 * 🧰 Utilities
 */

// Check whether a repository path contains an ignored segment
function isIgnoredPath(filename: string, analysis: AnalysisSettings): boolean {
  return filename
    .split("/")
    .some((segment) => analysis.ignoredPathSegments.includes(segment));
}

// Extract `stderr` (= "standard error") safely from a failed GitHub CLI process for security reasons
// To avoid private repository details or other sensitive GitHub response data to leak into the logs
function getProcessStderr(error: unknown): string {
  if (!error || typeof error !== "object" || !("stderr" in error)) {
    return "";
  }

  const stderr = error.stderr;

  if (typeof stderr === "string") {
    return stderr;
  }

  if (Buffer.isBuffer(stderr)) {
    return stderr.toString("utf8");
  }

  return "";
}

/*
 * 🌐 GitHub API
 */

/**
 * @description Creates a GitHub API client backed by the GitHub CLI.
 *
 * By default, analysis uses `TECH_STATS_TOKEN` and suppresses the workflow `GITHUB_TOKEN`,
 * so repository analysis cannot accidentally inherit publication credentials.
 *
 * Local credential mode may be enabled outside GitHub Actions for development.
 *
 * @param options - GitHub client execution options.
 * @returns A typed function for performing GitHub API GET requests.
 */
function githubClient({
  localGh = false,
}: { localGh?: boolean } = {}): GitHubClient {
  if (localGh && process.env.GITHUB_ACTIONS) {
    throw new Error("🔊 Local credential mode is unavailable in Actions.");
  }

  if (!localGh && !process.env.TECH_STATS_TOKEN) {
    throw new Error("🔊 `TECH_STATS_TOKEN` is required for analysis.");
  }

  return <T>(
    endpoint: string,
    {
      paginate = false,
      emptyAllowed = false,
    }: {
      paginate?: boolean;
      emptyAllowed?: boolean;
    } = {},
  ): T => {
    try {
      const response = execFileSync(
        "gh",
        [
          "api",
          "--method",
          "GET",
          endpoint,
          "-H",
          "Accept: application/vnd.github+json",
          ...(paginate ? ["--paginate", "--slurp"] : []),
        ],
        {
          encoding: "utf8",
          maxBuffer: 32 * 1024 * 1024,
          stdio: ["ignore", "pipe", "pipe"],
          timeout: 120_000,
          env: localGh
            ? process.env
            : {
                ...process.env,
                GH_TOKEN: process.env.TECH_STATS_TOKEN,
                GITHUB_TOKEN: "",
              },
        },
      );

      return JSON.parse(response) as T;
    } catch (error) {
      /*
       * An empty Git repository has no Git tree.
       * Other errors fail closed because stderr may contain private details.
       */
      if (emptyAllowed && /HTTP 409/.test(getProcessStderr(error))) {
        return null as T;
      }

      throw new Error(
        "🔊 GitHub analysis request failed; private details suppressed. Check token access, rate limits & repository availability.",
      );
    }
  };
}

/*
 * 🌳 Repository Trees
 */

/**
 * @description Reads every eligible checked-in file from a repository Git tree.
 *
 * Recursive GitHub tree responses are used when complete. If GitHub truncates
 * the recursive response, the tree is walked manually so analysis never accepts
 * partial repository evidence.
 *
 * Ignored paths & symbolic links are excluded from the returned entries.
 *
 * @param api - GitHub API client.
 * @param repository - Repository whose default branch must be inspected.
 * @param analysis - Validated repository-analysis settings.
 * @returns Eligible repository Git tree entries.
 */
function readRepoTree(
  api: GitHubClient,
  repository: GitHubRepository,
  analysis: AnalysisSettings,
): GitTreeEntry[] {
  const base = `repos/${repository.full_name}/git/trees/`;

  const tree = api<GitTreeResponse | null>(
    `${base}${encodeURIComponent(repository.default_branch)}?recursive=1`,
    { emptyAllowed: repository.size === 0 },
  );

  if (tree === null) {
    return [];
  }

  if (!tree.truncated) {
    return tree.tree.filter(
      (entry) =>
        entry.type === "blob" &&
        entry.mode !== "120000" &&
        !isIgnoredPath(entry.path, analysis),
    );
  }

  /*
   * GitHub limits recursive tree responses.
   * Walk each subtree instead of accepting incomplete evidence.
   */
  const queue = [
    {
      sha: tree.sha,
      prefix: "",
    },
  ];

  const files: GitTreeEntry[] = [];

  for (let cursor = 0; cursor < queue.length; cursor += 1) {
    const item = queue[cursor];

    if (!item) {
      continue;
    }

    const subtree = api<GitTreeResponse>(`${base}${item.sha}`);

    if (subtree.truncated) {
      throw new Error(
        "🔊 Git tree remains truncated; refusing partial statistics.",
      );
    }

    for (const entry of subtree.tree) {
      const filename = `${item.prefix}${entry.path}`;

      if (isIgnoredPath(filename, analysis)) {
        continue;
      }

      if (entry.type === "tree") {
        queue.push({
          sha: entry.sha,
          prefix: `${filename}/`,
        });

        continue;
      }

      if (entry.type === "blob" && entry.mode !== "120000") {
        files.push({
          ...entry,
          path: filename,
        });
      }
    }
  }

  return files;
}

export { githubClient, readRepoTree };
