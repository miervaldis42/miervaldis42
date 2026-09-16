// 📦 Imports
import { existsSync, readFileSync, readdirSync } from "node:fs";
import path from "node:path";

// 📍 Engine Paths
import { CONFIG_DIRECTORY, REPOSITORY_ROOT } from "@constants/paths.js";

// 🏷️ Types
import type {
  AnalysisSettings,
  PathsSettings,
  RepositorySettings,
  ResolvedPaths,
  LoadedConfig,
} from "@customTypes/config.js";
import type { DetectionRules } from "@customTypes/detection.js";
import type {
  TechnologyDefinition,
  StatisticsDefinition,
} from "@customTypes/definitions.js";
import type { RenderingSettings } from "@customTypes/rendering.js";

/*
 * 🧰 Utilities
 */

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value && typeof value === "object" && !Array.isArray(value));
}

function readJson(filename: string): unknown {
  return JSON.parse(readFileSync(filename, "utf8")) as unknown;
}

function isStringArray(value: unknown): value is string[] {
  return (
    Array.isArray(value) && value.every((item) => typeof item === "string")
  );
}

function isRepositoryName(value: string): boolean {
  return /^[\w.-]+\/[\w.-]+$/.test(value);
}

function resolveRepositoryPath(configuredPath: string): string {
  if (!configuredPath || path.isAbsolute(configuredPath)) {
    throw new Error(
      "🔊 Configured engine paths must be non-empty repository-relative paths.",
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
    throw new Error("🔊 Invalid repository settings.");
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
    throw new Error("🔊 Invalid analysis settings.");
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
    throw new Error("🔊 Invalid rendering settings.");
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
      throw new Error(`🔊 Invalid rendering layout value: ${key}.`);
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
        throw new Error(`🔊 Invalid ${name} rendering color: ${key}.`);
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
    throw new Error("🔊 Invalid path settings.");
  }

  return {
    definitions: value.definitions,
    icons: value.icons,
    statistics: value.statistics,
  };
}

function validateDetectionRules(value: unknown): DetectionRules {
  if (!isRecord(value)) {
    throw new Error("🔊 Invalid detection rules.");
  }

  const rules: DetectionRules = {};

  for (const [technology, rawRule] of Object.entries(value)) {
    if (!/^[a-z0-9-]+$/.test(technology) || !isRecord(rawRule)) {
      throw new Error("🔊 Invalid technology detection rule.");
    }

    const rule: DetectionRules[string] = {};

    if (rawRule.dependencies !== undefined) {
      if (!isRecord(rawRule.dependencies)) {
        throw new Error(
          `🔊 Invalid dependency detection rules for ${technology}.`,
        );
      }

      const exact = rawRule.dependencies.exact;
      const prefix = rawRule.dependencies.prefix;

      if (exact !== undefined && !isStringArray(exact)) {
        throw new Error(`🔊 Invalid exact dependency rules for ${technology}.`);
      }

      if (prefix !== undefined && !isStringArray(prefix)) {
        throw new Error(
          `🔊 Invalid dependency-prefix rules for ${technology}.`,
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
          `🔊 Invalid configuration-file rules for ${technology}.`,
        );
      }

      rule.configFiles = [...rawRule.configFiles];
    }

    if (rawRule.packageJsonFields !== undefined) {
      if (!isStringArray(rawRule.packageJsonFields)) {
        throw new Error(
          `🔊 Invalid package.json-field rules for ${technology}.`,
        );
      }

      rule.packageJsonFields = [...rawRule.packageJsonFields];
    }

    if (!rule.dependencies && !rule.configFiles && !rule.packageJsonFields) {
      throw new Error(
        `🔊 Detection rule for ${technology} does not define any evidence.`,
      );
    }

    rules[technology] = rule;
  }

  return rules;
}

function validateTechnologyDefinition(
  value: unknown,
  ids: Set<string>,
): TechnologyDefinition {
  if (
    !isRecord(value) ||
    typeof value.id !== "string" ||
    !/^[a-z0-9-]+$/.test(value.id) ||
    typeof value.name !== "string" ||
    !value.name.trim() ||
    typeof value.metric !== "string"
  ) {
    throw new Error("🔊 Invalid technology definition.");
  }

  if (ids.has(value.id)) {
    throw new Error(`🔊 Duplicate technology definition: ${value.id}.`);
  }

  ids.add(value.id);

  const hasIcon = typeof value.icon === "string" && Boolean(value.icon.trim());

  const hasThemeIcons =
    isRecord(value.icons) &&
    typeof value.icons.light === "string" &&
    Boolean(value.icons.light.trim()) &&
    typeof value.icons.dark === "string" &&
    Boolean(value.icons.dark.trim());

  if (hasIcon === hasThemeIcons) {
    throw new Error(
      `🔊 Technology ${value.id} must define either icon or light/dark icons.`,
    );
  }

  const iconDefinition = hasIcon
    ? { icon: value.icon as string }
    : {
        icons: {
          light: (value.icons as Record<string, unknown>).light as string,
          dark: (value.icons as Record<string, unknown>).dark as string,
        },
      };

  if (
    value.metric === "language" &&
    typeof value.language === "string" &&
    value.language.trim()
  ) {
    return {
      id: value.id,
      name: value.name,
      metric: "language",
      language: value.language,
      ...iconDefinition,
    };
  }

  if (
    value.metric === "adoption" &&
    typeof value.rule === "string" &&
    value.rule.trim()
  ) {
    return {
      id: value.id,
      name: value.name,
      metric: "adoption",
      rule: value.rule,
      ...iconDefinition,
    };
  }

  if (
    value.metric === "curated" &&
    typeof value.label === "string" &&
    value.label.trim()
  ) {
    return {
      id: value.id,
      name: value.name,
      metric: "curated",
      label: value.label,
      ...iconDefinition,
    };
  }

  throw new Error(
    `🔊 Invalid ${value.metric} metric definition for ${value.id}.`,
  );
}

function loadDefinitions(definitionsDirectory: string): StatisticsDefinition[] {
  if (!existsSync(definitionsDirectory)) {
    throw new Error("🔊 Statistics definitions directory does not exist.");
  }

  const filenames = readdirSync(definitionsDirectory)
    .filter((name) => name.endsWith(".json"))
    .sort();

  if (!filenames.length) {
    throw new Error("🔊 No statistics definitions were found.");
  }

  const technologyIds = new Set<string>();
  const sectionIds = new Set<string>();

  return filenames.map((filename) => {
    const value = readJson(path.join(definitionsDirectory, filename));

    if (
      !isRecord(value) ||
      typeof value.id !== "string" ||
      !/^[a-z-]+$/.test(value.id) ||
      typeof value.title !== "string" ||
      !value.title.trim() ||
      !Array.isArray(value.technologies) ||
      !value.technologies.length
    ) {
      throw new Error(`🔊 Invalid statistics definition: ${filename}.`);
    }

    if (sectionIds.has(value.id)) {
      throw new Error(
        `🔊 Duplicate statistics section definition: ${value.id}.`,
      );
    }

    sectionIds.add(value.id);

    return {
      id: value.id,
      title: value.title,
      technologies: value.technologies.map((technology) =>
        validateTechnologyDefinition(technology, technologyIds),
      ),
    };
  });
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

  const override = JSON.parse(rawOverride) as unknown;

  if (!isRecord(override)) {
    throw new Error("🔊 Invalid private repository override.");
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
    throw new Error("🔊 Invalid private repository override.");
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
   * 1. Resolve engine resource paths.
   * 2. Load the statistics definitions describing what must be generated.
   * 3. Load the repository-selection configuration.
   * 4. Load the repository-analysis configuration.
   * 5. Load the technology-detection rules.
   * 6. Load the rendering configuration.
   * 7. Return the trusted typed configuration.
   */

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

export { loadConfig };
