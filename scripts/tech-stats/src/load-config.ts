// 📦 Imports
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { parseEnv } from "node:util";

// ⚙️ Engine
import { loadDefinitions } from "@/load-definitions.js";

// 📍 Engine Paths
import {
  CONFIG_DIRECTORY,
  ENGINE_ROOT,
  REPOSITORY_ROOT,
} from "@constants/paths.js";

// 🧰 Utilities
import { readJson } from "@utils/json.js";
import { isRecord, isStringArray } from "@utils/type-guards.js";

// 🏷️ Types
import type {
  AnalysisSettings,
  PathsSettings,
  RepositorySettings,
  ResolvedPaths,
  LoadedConfig,
} from "@customTypes/config.js";
import type { DetectionRules } from "@customTypes/detection.js";
import type { RenderingSettings } from "@customTypes/rendering.js";

/*
 * 🧰 Utilities
 */

// Check the format of a repository name after its value has been validated as a string
function isRepositoryName(value: string): boolean {
  return /^[\w.-]+\/[\w.-]+$/.test(value);
}

// Resolve a validated repository-relative path while preventing traversal outside the repository
function resolveRepositoryPath(configuredPath: string): string {
  if (!configuredPath || path.isAbsolute(configuredPath)) {
    throw new Error(
      "🔊 Configured engine paths cannot be empty or use an absolute path. Use a path relative to the repository instead.",
    );
  }

  const resolved = path.resolve(REPOSITORY_ROOT, configuredPath);
  const relative = path.relative(REPOSITORY_ROOT, resolved);
  if (
    !relative ||
    relative === ".." ||
    relative.startsWith(`..${path.sep}`) ||
    path.isAbsolute(relative)
  ) {
    throw new Error(
      "🔊 Configured engine paths must remain inside the repository root.",
    );
  }

  return resolved;
}

/*
 * ✅ Configuration Validation
 */

function validateRepositorySettings(value: unknown): RepositorySettings {
  if (
    !isRecord(value) ||
    typeof value.owner !== "string" ||
    !value.owner.trim() ||
    !isStringArray(value.include) ||
    !isStringArray(value.exclude) ||
    value.include.some((name) => !isRepositoryName(name)) ||
    value.exclude.some((name) => !isRepositoryName(name))
  ) {
    throw new Error(
      "🔊 The repository settings are invalid. `owner` must contain a name, while `include` & `exclude` must contain lists of `owner/repository` names.",
    );
  }

  return {
    owner: value.owner,
    include: [...value.include],
    exclude: [...value.exclude],
  };
}

function validateAnalysisSettings(value: unknown): AnalysisSettings {
  if (
    !isRecord(value) ||
    !isStringArray(value.ignoredPathSegments) ||
    typeof value.maxEvidenceFiles !== "number" ||
    !Number.isInteger(value.maxEvidenceFiles) ||
    value.maxEvidenceFiles < 1 ||
    typeof value.maxEvidenceBytes !== "number" ||
    !Number.isInteger(value.maxEvidenceBytes) ||
    value.maxEvidenceBytes < 1
  ) {
    throw new Error(
      "🔊 The analysis settings are invalid. `ignoredPathSegments` must contain a list of path segments, while `maxEvidenceFiles` & `maxEvidenceBytes` must be positive integers.",
    );
  }

  return {
    ignoredPathSegments: [...value.ignoredPathSegments],
    maxEvidenceFiles: value.maxEvidenceFiles,
    maxEvidenceBytes: value.maxEvidenceBytes,
  };
}

function validateRenderingSettings(value: unknown): RenderingSettings {
  if (
    !isRecord(value) ||
    !isRecord(value.layout) ||
    !isRecord(value.colors) ||
    !isRecord(value.colors.light) ||
    !isRecord(value.colors.dark)
  ) {
    throw new Error(
      "🔊 The rendering settings are invalid. `layout`, `colors.light` & `colors.dark` must each contain an object of rendering values.",
    );
  }

  const layoutKeys = [
    "canvasWidth",
    "cardWidth",
    "cardGap",
    "iconSize",
    "nameFontSize",
    "statisticFontSize",
    "pillWidth",
    "pillHeight",
    "outerHorizontalPadding",
    "outerVerticalPadding",
    "iconNameGap",
    "namePillGap",
    "pillTextBaseline",
    "maxCardsPerRow",
    "rowGap",
  ] as const;

  for (const key of layoutKeys) {
    const layoutValue = value.layout[key];

    if (
      typeof layoutValue !== "number" ||
      !Number.isFinite(layoutValue) ||
      layoutValue < 0
    ) {
      throw new Error(
        `🔊 The rendering layout value \`${key}\` is invalid. It must be a number greater than or equal to 0.`,
      );
    }
  }

  const maxCardsPerRow = value.layout.maxCardsPerRow;
  if (
    typeof maxCardsPerRow !== "number" ||
    !Number.isInteger(maxCardsPerRow) ||
    maxCardsPerRow < 1
  ) {
    throw new Error("🔊 `maxCardsPerRow` must be a positive integer.");
  }

  const validateTheme = (
    theme: Record<string, unknown>,
    name: string,
  ): void => {
    for (const key of ["text", "pill", "statistic"] as const) {
      if (
        typeof theme[key] !== "string" ||
        !/^#[0-9a-fA-F]{6}$/.test(theme[key])
      ) {
        throw new Error(
          `🔊 The ${name} rendering color \`${key}\` is invalid. Use a six-digit hexadecimal color such as \`#FFFFFF\`.`,
        );
      }
    }
  };

  validateTheme(value.colors.light, "light");
  validateTheme(value.colors.dark, "dark");

  return value as RenderingSettings;
}

function validatePathsSettings(value: unknown): PathsSettings {
  if (
    !isRecord(value) ||
    typeof value.definitions !== "string" ||
    typeof value.icons !== "string" ||
    typeof value.statistics !== "string"
  ) {
    throw new Error(
      "🔊 The path settings are invalid. `definitions`, `icons` & `statistics` must each contain a path as text.",
    );
  }

  return {
    definitions: value.definitions,
    icons: value.icons,
    statistics: value.statistics,
  };
}

function validateDetectionRules(value: unknown): DetectionRules {
  if (!isRecord(value)) {
    throw new Error(
      "🔊 The detection rules are invalid. The configuration must contain an object of technology rules.",
    );
  }

  const rules: DetectionRules = {};

  for (const [technology, rawRule] of Object.entries(value)) {
    if (!/^[a-z0-9-]+$/.test(technology) || !isRecord(rawRule)) {
      throw new Error(
        `🔊 The detection rule for \`${technology}\` is invalid. Technology IDs must use lowercase letters, numbers & hyphens, and each technology must contain a rule object.`,
      );
    }

    const rule: DetectionRules[string] = {};

    if (rawRule.dependencies !== undefined) {
      if (!isRecord(rawRule.dependencies)) {
        throw new Error(
          `🔊 The dependency detection rule for \`${technology}\` is invalid. \`dependencies\` must contain an object with optional \`exact\` & \`prefix\` lists.`,
        );
      }

      const exact = rawRule.dependencies.exact;
      const prefix = rawRule.dependencies.prefix;

      if (exact !== undefined && !isStringArray(exact)) {
        throw new Error(
          `🔊 The exact dependency rule for \`${technology}\` is invalid. \`dependencies.exact\` must contain a list of dependency names.`,
        );
      }

      if (prefix !== undefined && !isStringArray(prefix)) {
        throw new Error(
          `🔊 The dependency-prefix rule for \`${technology}\` is invalid. \`dependencies.prefix\` must contain a list of dependency prefixes.`,
        );
      }

      rule.dependencies = {
        ...(exact ? { exact: [...exact] } : {}),
        ...(prefix ? { prefix: [...prefix] } : {}),
      };
    }

    if (rawRule.configFiles !== undefined) {
      if (!isStringArray(rawRule.configFiles)) {
        throw new Error(
          `🔊 The configuration-file rule for \`${technology}\` is invalid. \`configFiles\` must contain a list of configuration-file names.`,
        );
      }

      rule.configFiles = [...rawRule.configFiles];
    }

    if (rawRule.packageJsonFields !== undefined) {
      if (!isStringArray(rawRule.packageJsonFields)) {
        throw new Error(
          `🔊 The package.json-field rule for \`${technology}\` is invalid. \`packageJsonFields\` must contain a list of field names.`,
        );
      }

      rule.packageJsonFields = [...rawRule.packageJsonFields];
    }

    if (!rule.dependencies && !rule.configFiles && !rule.packageJsonFields) {
      throw new Error(
        `🔊 The detection rule for \`${technology}\` must define at least one evidence source: \`dependencies\`, \`configFiles\` or \`packageJsonFields\`.`,
      );
    }

    rules[technology] = rule;
  }

  return rules;
}

/*
 * 🔐 Local Repository Environment
 */

function loadLocalRepositoryEnvironment(
  filename = path.join(ENGINE_ROOT, ".env"),
): void {
  // GitHub Actions must use its supplied configuration.
  if (process.env.GITHUB_ACTIONS) {
    return;
  }

  // Explicit process variables take precedence.
  if (process.env.TECH_STATS_REPOSITORIES !== undefined) {
    return;
  }

  // Local .env is optional.
  if (!existsSync(filename)) {
    return;
  }

  // Only load the supported repository-selection variable.
  const { TECH_STATS_REPOSITORIES } = parseEnv(readFileSync(filename, "utf8"));

  if (TECH_STATS_REPOSITORIES !== undefined) {
    process.env.TECH_STATS_REPOSITORIES = TECH_STATS_REPOSITORIES;
  }
}

/*
 * 🔐 Private Repository Overrides
 */

function applyRepositoryOverride(
  repository: RepositorySettings,
): RepositorySettings {
  const rawOverride = process.env.TECH_STATS_REPOSITORIES?.trim();

  if (!rawOverride) {
    return repository;
  }

  let override: unknown;

  try {
    override = JSON.parse(rawOverride) as unknown;
  } catch {
    throw new Error(
      "🔊 `TECH_STATS_REPOSITORIES` could not be read because its value is not valid JSON.",
    );
  }

  if (!isRecord(override)) {
    throw new Error(
      "🔊 `TECH_STATS_REPOSITORIES` is invalid. It must be a JSON object where `include` & `exclude`, when provided, are lists of `owner/repository` names.",
    );
  }

  const include =
    override.include === undefined ? repository.include : override.include;

  const exclude =
    override.exclude === undefined ? repository.exclude : override.exclude;

  if (
    !isStringArray(include) ||
    !isStringArray(exclude) ||
    include.some((name) => !isRepositoryName(name)) ||
    exclude.some((name) => !isRepositoryName(name))
  ) {
    throw new Error(
      "🔊 `TECH_STATS_REPOSITORIES` is invalid. It must be a JSON object where `include` & `exclude`, when provided, are lists of `owner/repository` names.",
    );
  }

  return {
    ...repository,
    include: [...include],
    exclude: [...exclude],
  };
}

/*
 * 🚪 Public API
 */

/**
 * @description Loads, validates & resolves all Technology Statistics configuration required by the engine.
 *
 * Public configuration is read from the engine config directory.
 *
 * Private repository include/exclude overrides may be supplied through `TECH_STATS_REPOSITORIES` without being committed to public configuration.
 *
 * @returns A trusted typed configuration object ready for engine consumption.
 */
function loadConfig(): LoadedConfig {
  /*
   * Loading flow:
   * 1. Load local repository environment
   * 2. Resolve engine resource paths
   * 3. Load the statistics definitions describing what must be generated
   * 4. Load the repository-selection configuration
   * 5. Load the repository-analysis configuration
   * 6. Load the technology-detection rules
   * 7. Load the rendering configuration
   * 8. Return the trusted typed configuration
   */

  loadLocalRepositoryEnvironment();

  const paths = validatePathsSettings(
    readJson(path.join(CONFIG_DIRECTORY, "paths-settings.json")),
  );

  const resolvedPaths: ResolvedPaths = {
    definitions: resolveRepositoryPath(paths.definitions),
    icons: resolveRepositoryPath(paths.icons),
    statistics: resolveRepositoryPath(paths.statistics),
  };

  const definitions = loadDefinitions(resolvedPaths.definitions);

  const repository = applyRepositoryOverride(
    validateRepositorySettings(
      readJson(path.join(CONFIG_DIRECTORY, "repository-settings.json")),
    ),
  );

  const analysis = validateAnalysisSettings(
    readJson(path.join(CONFIG_DIRECTORY, "analysis-settings.json")),
  );

  const detectionRules = validateDetectionRules(
    readJson(path.join(CONFIG_DIRECTORY, "detection-rules.json")),
  );

  const rendering = validateRenderingSettings(
    readJson(path.join(CONFIG_DIRECTORY, "rendering-settings.json")),
  );

  return {
    paths,
    resolvedPaths,
    definitions,
    repository,
    analysis,
    detectionRules,
    rendering,
  };
}

export { loadLocalRepositoryEnvironment, loadConfig };
