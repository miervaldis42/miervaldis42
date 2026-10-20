/**
 * 🏷️ Type Definitions
 */
type DependencyDetectionRules = {
  exact?: string[];
  prefix?: string[];
};

type TechnologyDetectionRule = {
  dependencies?: DependencyDetectionRules;
  configFiles?: string[];
  packageJsonFields?: string[];
};

type DetectionRules = Record<string, TechnologyDetectionRule>;

type TechnologyEvidence = {
  path: string;
  signal: string;
};

type RepositoryEvidence = Record<string, TechnologyEvidence[]>;

type EvidenceFiles = Record<string, string>;

type AddEvidence = (technology: string, file: string, signal: string) => void;

export type {
  DependencyDetectionRules,
  TechnologyDetectionRule,
  DetectionRules,
  TechnologyEvidence,
  RepositoryEvidence,
  EvidenceFiles,
  AddEvidence,
};
