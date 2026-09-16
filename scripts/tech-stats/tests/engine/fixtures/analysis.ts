// 🏷️ Types
import type {
  AnalyzedRepository,
  SelectedRepository,
} from "@customTypes/analysis.js";

/*
 * 🧩 Analysis Fixtures
 */

function analyzedRepository(
  name = "owner/repository",
  overrides: Partial<AnalyzedRepository> = {},
): AnalyzedRepository {
  return {
    name,
    private: false,
    defaultBranch: "main",
    languages: {},
    evidence: {},
    ...overrides,
  };
}

function selectedRepository(
  fullName: string,
  overrides: Partial<SelectedRepository> = {},
): SelectedRepository {
  const owner = fullName.split("/")[0] ?? "owner";

  return {
    full_name: fullName,
    owner: {
      login: owner,
    },
    fork: false,
    archived: false,
    private: false,
    default_branch: "main",
    size: 1,
    reason: null,
    ...overrides,
  };
}

export { analyzedRepository, selectedRepository };
