// 🕵️ Specialized Detectors
import {
  detectDockerConfiguration,
  detectDockerImages,
  isDockerEvidenceFile,
} from "@detectors/docker.js";
import { detectHuskyHooks } from "@detectors/husky.js";
import { detectNodeRuntime } from "@detectors/node.js";
import {
  detectPrismaProviders,
  isPrismaEvidenceFile,
} from "@detectors/prisma.js";
import {
  isGitHubWorkflowEvidenceFile,
  detectVercelInPackageScript,
  detectVercelInWorkflow,
} from "@detectors/vercel.js";

// 🏷️ Types
import type {
  AddEvidence,
  DetectionRules,
  EvidenceFiles,
  RepositoryEvidence,
} from "@customTypes/detection.js";

// 🧰 Utilities
import { asRecord } from "@utils/object.js";

/**
 * @description Checks whether a repository path corresponds to a configured technology configuration file.
 *
 * The configured path may exist at the repository root or inside a nested workspace.
 *
 * @param repositoryPath - Repository-relative path being inspected
 * @param configuredPath - Configuration path declared by a detection rule
 * @returns Whether both paths identify the same configuration file
 */
function matchesConfigFile(
  repositoryPath: string,
  configuredPath: string,
): boolean {
  return (
    repositoryPath === configuredPath ||
    repositoryPath.endsWith(`/${configuredPath}`)
  );
}

// 🔎 Generic Detection

/**
 * @description Detects technologies through configuration-file paths declared in the generic detection rules.
 *
 * @param paths - All eligible repository-relative file paths
 * @param rules - Declarative technology detection rules
 * @param addEvidence - Callback used to record detected evidence
 */
function detectConfiguredPaths(
  paths: string[],
  rules: DetectionRules,
  addEvidence: AddEvidence,
): void {
  for (const repositoryPath of paths) {
    for (const [technology, rule] of Object.entries(rules)) {
      if (
        (rule.configFiles ?? []).some((configuredPath) =>
          matchesConfigFile(repositoryPath, configuredPath),
        )
      ) {
        addEvidence(technology, repositoryPath, "dedicated configuration");
      }
    }
  }
}

/**
 * @description Detects technologies declared directly through `package.json` dependencies.
 *
 * Exact dependency names and package-prefix rules are both supported.
 *
 * @param manifestPath - Repository-relative path of the package.json file
 * @param manifest - Parsed package.json content
 * @param rules - Declarative technology detection rules
 * @param addEvidence - Callback used to record detected evidence
 */
function detectDependencies(
  manifestPath: string,
  manifest: Record<string, unknown>,
  rules: DetectionRules,
  addEvidence: AddEvidence,
): void {
  const dependencies = {
    ...asRecord(manifest.dependencies),
    ...asRecord(manifest.devDependencies),
    ...asRecord(manifest.peerDependencies),
    ...asRecord(manifest.optionalDependencies),
  };

  for (const [technology, rule] of Object.entries(rules)) {
    const exactDependencies = rule.dependencies?.exact ?? [];
    const dependencyPrefixes = rule.dependencies?.prefix ?? [];

    for (const dependency of Object.keys(dependencies)) {
      const exactMatch = exactDependencies.includes(dependency);
      const prefixMatch = dependencyPrefixes.some((prefix) =>
        dependency.startsWith(prefix),
      );

      if (exactMatch || prefixMatch) {
        addEvidence(
          technology,
          manifestPath,
          `direct package declaration: ${dependency}`,
        );
      }
    }
  }
}

/**
 * @description Detects technologies configured through dedicated `package.json` fields declared by the detection rules.
 *
 * @param manifestPath - Repository-relative path of the package.json file
 * @param manifest - Parsed package.json content
 * @param rules - Declarative technology detection rules
 * @param addEvidence - Callback used to record detected evidence
 */
function detectPackageJsonFields(
  manifestPath: string,
  manifest: Record<string, unknown>,
  rules: DetectionRules,
  addEvidence: AddEvidence,
): void {
  for (const [technology, rule] of Object.entries(rules)) {
    for (const field of rule.packageJsonFields ?? []) {
      if (Object.hasOwn(manifest, field)) {
        addEvidence(technology, manifestPath, `package.json field: ${field}`);
      }
    }
  }
}

/**
 * @description Passes package.json script commands to specialized detectors that require script-level interpretation.
 *
 * @param manifestPath - Repository-relative path of the package.json file
 * @param manifest - Parsed `package.json` content
 * @param addEvidence - Callback used to record detected evidence
 */
function detectManifestScripts(
  manifestPath: string,
  manifest: Record<string, unknown>,
  addEvidence: AddEvidence,
): void {
  const scripts = asRecord(manifest.scripts);

  for (const command of Object.values(scripts)) {
    if (typeof command !== "string") {
      continue;
    }

    detectVercelInPackageScript(manifestPath, command, addEvidence);
  }
}

// 🚪 Public API

/**
 * @description Determines whether a repository file must be downloaded because one or more specialized detectors need to inspect its contents.
 *
 * Files detected purely from their paths do not need to be downloaded.
 *
 * @param filename - Repository-relative file path.
 * @returns Whether the file contents are required for technology detection.
 */
export function isEvidenceFile(filename: string): boolean {
  return (
    /(^|\/)package\.json$/.test(filename) ||
    isPrismaEvidenceFile(filename) ||
    isDockerEvidenceFile(filename) ||
    isGitHubWorkflowEvidenceFile(filename)
  );
}

/**
 * Main Orchestrator
 *
 * @description Detects all supported technology evidence found in one repository.
 *
 * Generic declarative rules handle ordinary evidence such as dependencies, configuration files & package.json fields.
 *
 * Specialized detectors handle evidence that requires custom interpretation.
 *
 * @param paths - All eligible repository-relative paths.
 * @param files - Downloaded evidence files keyed by repository-relative path.
 * @param rules - Validated declarative technology detection rules.
 * @returns Technology evidence grouped by technology identifier.
 */
export function detect(
  paths: string[],
  files: EvidenceFiles,
  rules: DetectionRules,
): RepositoryEvidence {
  /*
   * Detection flow:
   * 1. Create the repository evidence collection.
   * 2. Detect path-based evidence from generic configuration rules.
   * 3. Run specialized detectors that only require repository paths.
   * 4. Inspect downloaded evidence files.
   * 5. Apply generic package.json detection rules.
   * 6. Run specialized content-based detectors.
   * 7. Return all collected evidence grouped by technology.
   */

  const evidence: RepositoryEvidence = {};

  const addEvidence: AddEvidence = (technology, file, signal) => {
    (evidence[technology] ??= []).push({
      path: file,
      signal,
    });
  };

  // 2. Generic path-based detection
  detectConfiguredPaths(paths, rules, addEvidence);

  // 3. Specialized detectors that only require repository paths.
  detectHuskyHooks(paths, addEvidence);
  detectDockerConfiguration(paths, addEvidence);

  // 4. Inspect files whose contents were required for detection
  for (const [filename, source] of Object.entries(files)) {
    if (/(^|\/)package\.json$/.test(filename)) {
      /*
       * 5. Apply generic manifest rules first, then specialized detectors
       * that interpret Node.js runtime or script behavior.
       */

      // Invalid manifests intentionally fail the complete repository analysis
      // They must never silently lower technology adoption
      const manifest = JSON.parse(source) as Record<string, unknown>;

      detectDependencies(filename, manifest, rules, addEvidence);

      detectPackageJsonFields(filename, manifest, rules, addEvidence);

      detectNodeRuntime(filename, manifest, paths, addEvidence);

      detectManifestScripts(filename, manifest, addEvidence);
    }

    /*
     * 6. Specialized content detectors inspect formats that require more
     * than a simple declarative path or dependency rule
     */
    detectPrismaProviders(filename, source, addEvidence);
    detectDockerImages(filename, source, addEvidence);
    detectVercelInWorkflow(filename, source, addEvidence);
  }

  return evidence;
}
