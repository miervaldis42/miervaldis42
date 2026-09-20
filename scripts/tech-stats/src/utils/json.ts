// 📦 Imports
import { readFileSync } from "node:fs";

// Read JSON from disk without assuming that its contents match any engine type
function readJson(filename: string): unknown {
  return JSON.parse(readFileSync(filename, "utf8")) as unknown;
}

export { readJson };
