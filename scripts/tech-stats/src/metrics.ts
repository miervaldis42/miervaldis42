// 🏷️ Types
import type {
  AnalysisSummary,
  AnalyzedRepository,
  TechnologyMetric,
} from "@customTypes/analysis.js";
import type { StatisticsDefinition } from "@customTypes/definitions.js";

/*
 * 📊 Metric Calculation
 */

/**
 * @description Calculates all configured Technology Statistics metrics from
 * analyzed repository language bytes & detected technology evidence.
 *
 * Language percentages use only the language technologies configured in the
 * statistics definitions as their denominator.
 *
 * Adoption percentages measure the share of analyzed repositories containing
 * evidence for the configured technology rule.
 *
 * Curated technologies preserve their configured display label without
 * calculating a repository-derived percentage.
 *
 * @param repositories - Repositories successfully analyzed by the engine.
 * @param definitions - Validated Technology Statistics definitions.
 * @returns Aggregate language measurements & calculated technology metrics.
 */
function calculateMetrics(
  repositories: AnalyzedRepository[],
  definitions: StatisticsDefinition[],
): AnalysisSummary {
  /*
   * Metric flow:
   * 1. Aggregate GitHub Linguist bytes across analyzed repositories
   * 2. Calculate the denominator for configured language statistics
   * 3. Calculate each configured language, adoption or curated metric
   * 4. Return the aggregate measurements used by reports & rendering
   */

  const allLanguageBytes: Record<string, number> = {};

  // 1. Aggregate GitHub Linguist bytes across analyzed repositories
  for (const repository of repositories) {
    for (const [language, count] of Object.entries(repository.languages)) {
      if (!Number.isSafeInteger(count) || count < 0) {
        throw new Error("🔊 Invalid Linguist bytes.");
      }

      allLanguageBytes[language] = (allLanguageBytes[language] ?? 0) + count;
    }
  }

  // 2. Calculate the denominator for configured language statistics
  const configuredLanguages = definitions
    .flatMap((section) => section.technologies)
    .filter((technology) => technology.metric === "language");

  const languageBytes = configuredLanguages.reduce(
    (sum, technology) => sum + (allLanguageBytes[technology.language] ?? 0),
    0,
  );

  if (!Number.isSafeInteger(languageBytes)) {
    throw new Error("🔊 Language total exceeds safe precision.");
  }

  const metrics: Record<string, TechnologyMetric> = {};

  // 3. Calculate each configured technology metric
  for (const section of definitions) {
    for (const technology of section.technologies) {
      if (technology.metric === "curated") {
        metrics[technology.id] = {
          metric: "curated",
          label: technology.label,
        };

        continue;
      }

      const numerator =
        technology.metric === "language"
          ? (allLanguageBytes[technology.language] ?? 0)
          : repositories.filter(
              (repository) =>
                (repository.evidence[technology.rule]?.length ?? 0) > 0,
            ).length;

      const denominator =
        technology.metric === "language" ? languageBytes : repositories.length;

      const percentage =
        denominator > 0 ? (numerator / denominator) * 100 : null;

      metrics[technology.id] = {
        metric: technology.metric,
        numerator,
        denominator,
        percentage,
        label: percentage === null ? "No data" : `${percentage.toFixed(1)}%`,
      };
    }
  }

  // 4. Return aggregate measurements used by reports & rendering
  return {
    analyzedRepositories: repositories.length,
    languageBytes,
    allLanguageBytes,
    metrics,
  };
}

export { calculateMetrics };
