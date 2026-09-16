// 🏷️ Types
import type { GitHubRepository } from "@customTypes/github.js";

/*
 * 🧩 GitHub Fixtures
 */

function githubRepository(
  name: string,
  overrides: Partial<GitHubRepository> = {},
): GitHubRepository {
  return {
    full_name: `owner/${name}`,
    owner: {
      login: "owner",
    },
    fork: false,
    archived: false,
    private: false,
    default_branch: "main",
    size: 1,
    ...overrides,
  };
}

export { githubRepository };
