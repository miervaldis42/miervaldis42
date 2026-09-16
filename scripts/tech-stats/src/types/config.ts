// 🏷️📦 Imports
import type { DetectionRules } from "./detection.js";
import type { StatisticsDefinition } from "./definitions.js";
import type { RenderingSettings } from "./rendering.js";

/*
 * 🏷️ Type Definitions
 */

type RepositorySettings = {
  owner: string;
  include: string[];
  exclude: string[];
};

type AnalysisSettings = {
  ignoredPathSegments: string[];
  maxEvidenceFiles: number;
  maxEvidenceBytes: number;
};

type PathsSettings = {
  definitions: string;
  icons: string;
  statistics: string;
};

type ResolvedPaths = {
  definitions: string;
  icons: string;
  statistics: string;
};

type LoadedConfig = {
  paths: PathsSettings;
  resolvedPaths: ResolvedPaths;
  definitions: StatisticsDefinition[];
  repository: RepositorySettings;
  analysis: AnalysisSettings;
  detectionRules: DetectionRules;
  rendering: RenderingSettings;
};

export type {
  RepositorySettings,
  AnalysisSettings,
  PathsSettings,
  ResolvedPaths,
  LoadedConfig,
};
