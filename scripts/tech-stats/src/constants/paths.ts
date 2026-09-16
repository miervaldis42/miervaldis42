// 📦 Imports
import path from "node:path";
import { fileURLToPath } from "node:url";

/*
 * 📍 Engine Paths
 */

const ENGINE_ROOT = fileURLToPath(new URL("../../", import.meta.url));

const CONFIG_DIRECTORY = path.join(ENGINE_ROOT, "config");

const REPOSITORY_ROOT =
  process.env.GITHUB_WORKSPACE ??
  fileURLToPath(new URL("../../../../", import.meta.url));

export { ENGINE_ROOT, CONFIG_DIRECTORY, REPOSITORY_ROOT };
