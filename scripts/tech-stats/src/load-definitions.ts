// 📦 Imports
import { existsSync, readdirSync } from "node:fs";
import path from "node:path";
import { Validator } from "@cfworker/json-schema";

// 📍 Engine Paths
import { SCHEMAS_DIRECTORY } from "@constants/paths.js";

// 🧰 Utilities
import { readJson } from "@utils/json.js";

// 🏷️ Types
import type { Schema } from "@cfworker/json-schema";
import type { StatisticsDefinition } from "@customTypes/definitions.js";

/*
 * 📐 Schema Validation
 */

const statisticsDefinitionSchema = readJson(
  path.join(SCHEMAS_DIRECTORY, "statistics-definition.schema.json"),
) as Schema;

const statisticsDefinitionValidator = new Validator(
  statisticsDefinitionSchema,
  "7",
  false,
);

/*
 * 📚 Definition Loading
 */

function loadDefinitions(definitionsDirectory: string): StatisticsDefinition[] {
  // Ensure the configured definitions directory exists
  if (!existsSync(definitionsDirectory)) {
    throw new Error("🔊 Statistics definitions directory does not exist.");
  }

  // Discover the available statistics definition files in deterministic order
  const filenames = readdirSync(definitionsDirectory)
    .filter((name) => name.endsWith(".json"))
    .sort();

  if (!filenames.length) {
    throw new Error("🔊 No statistics definitions were found.");
  }

  // Track identifiers across all definitions to prevent collisions
  const technologyIds = new Set<string>();
  const sectionIds = new Set<string>();

  return filenames.map((filename) => {
    const rawDefinition = readJson(path.join(definitionsDirectory, filename));

    // Validate the complete structure of the statistics definition
    const validation = statisticsDefinitionValidator.validate(rawDefinition);

    if (!validation.valid) {
      throw new Error(`🔊 Invalid statistics definition: ${filename}.`);
    }

    const definition = rawDefinition as StatisticsDefinition;

    // Prevent multiple definition files from declaring the same section
    if (sectionIds.has(definition.id)) {
      throw new Error(
        `🔊 Duplicate statistics section definition: ${definition.id}.`,
      );
    }

    sectionIds.add(definition.id);

    // Keep every technology ID unique across all statistics definitions
    for (const technology of definition.technologies) {
      if (technologyIds.has(technology.id)) {
        throw new Error(
          `🔊 Duplicate technology definition: ${technology.id}.`,
        );
      }

      technologyIds.add(technology.id);
    }

    return definition;
  });
}

export { loadDefinitions };
