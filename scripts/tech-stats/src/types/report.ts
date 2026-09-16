// 🏷️📦 Imports
import type {
  AnalysisSummary,
  AnalyzedRepository,
  RepositoryExclusionReason,
} from "./analysis.js";

/*
 * 🏷️ Type Definitions
 */

type RepositorySelectionReport = {
  name: string;
  private: boolean;
  reason: RepositoryExclusionReason;
};

type AnalysisReport = {
  schemaVersion: 1;
  timestamp: string;
  includedRepositoryCount: number;
  excludedRepositoryCount: number;
  selection: RepositorySelectionReport[];
  privateRepositoryNames: string[];
  repositories: AnalyzedRepository[];
  summary: AnalysisSummary;
};

export type { RepositorySelectionReport, AnalysisReport };
