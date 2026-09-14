// 📦 Imports
import { readFileSync } from "node:fs";
import path from "node:path";

// 📍 Repository Path
import { REPOSITORY_ROOT } from "@constants/paths.js";

/*
 * 📋 Workflow Fixture
 */

// Load the workflow source with normalized line endings
const workflow = readFileSync(
  path.join(
    REPOSITORY_ROOT,
    ".github",
    "workflows",
    "update-tech-statistics.yml",
  ),
  "utf8",
).replaceAll("\r\n", "\n");

export { workflow };
