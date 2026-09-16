// 🏷️📦 Imports
import type { RepositoryEvidence } from "./detection.js";
import type { GitHubLanguages, GitHubRepository } from "./github.js";

/*
 * 🏷️ Type Definitions
 */

type RepositoryExclusionReason =
  | "other owner"
  | "fork"
  | "archived"
  | "profile repository"
  | "explicit exclusion"
  | "outside inclusion list"
  | null;

type SelectedRepository = GitHubRepository & {
  reason: RepositoryExclusionReason;
};

type AnalyzedRepository = {
  name: string;
  private: boolean;
  defaultBranch: string;
  languages: GitHubLanguages;
  evidence: RepositoryEvidence;
};

type CalculatedMetric = {
  metric: "language" | "adoption";
  numerator: number;
  denominator: number;
  percentage: number | null;
  label: string;
};

type CuratedMetric = {
  metric: "curated";
  label: string;
};

type TechnologyMetric = CalculatedMetric | CuratedMetric;

type AnalysisSummary = {
  analyzedRepositories: number;
  languageBytes: number;
  allLanguageBytes: Record<string, number>;
  metrics: Record<string, TechnologyMetric>;
};

export type {
  RepositoryExclusionReason,
  SelectedRepository,
  AnalyzedRepository,
  CalculatedMetric,
  CuratedMetric,
  TechnologyMetric,
  AnalysisSummary,
};
