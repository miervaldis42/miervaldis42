// 📦 Imports
import { pathToFileURL } from "node:url";

// Make a file path clickable
function createFileLink(filePath: string): string {
  const url = pathToFileURL(filePath).href;

  return `\u001B]8;;${url}\u0007${filePath}\u001B]8;;\u0007`;
}

export { createFileLink };
