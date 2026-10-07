// 🧪📦 Test Imports
import { expect } from "vitest";

/*
 * 🎯 Assertions
 */

function expectEngineError(callback: () => unknown, keywords: string[]): void {
  let thrownError: unknown;

  try {
    callback();
  } catch (error) {
    thrownError = error;
  }

  if (!(thrownError instanceof Error)) {
    throw new Error("Expected the engine feature to throw an Error.");
  }

  expect(thrownError.message).toContain("🔊");

  for (const keyword of keywords) {
    expect(thrownError.message.toLowerCase()).toContain(keyword.toLowerCase());
  }
}

export { expectEngineError };
