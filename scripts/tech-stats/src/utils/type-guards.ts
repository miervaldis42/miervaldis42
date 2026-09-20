// Raw JSON values enter the engine as `unknown` because their structure
// cannot be trusted until runtime validation proves what they contain
function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value && typeof value === "object" && !Array.isArray(value));
}

// Narrow an unknown raw value to an array of strings after runtime validation
function isStringArray(value: unknown): value is string[] {
  return (
    Array.isArray(value) && value.every((item) => typeof item === "string")
  );
}

export { isRecord, isStringArray };
