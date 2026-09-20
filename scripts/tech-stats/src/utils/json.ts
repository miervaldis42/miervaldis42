// 📦 Imports
import { readFileSync } from "node:fs";
import path from "node:path";

// Read JSON from disk without assuming that its contents match any engine type
function readJson(filename: string): unknown {
  const name = path.basename(filename);

  let content: string;

  try {
    content = readFileSync(filename, "utf8");
  } catch {
    throw new Error(
      `🔊 The JSON file \`${name}\` could not be read. Check that the file exists & can be accessed.`,
    );
  }

  try {
    return JSON.parse(content) as unknown;
  } catch {
    throw new Error(
      `🔊 The JSON file \`${name}\` contains invalid JSON. Check its syntax before running the engine again.`,
    );
  }
}

export { readJson };
