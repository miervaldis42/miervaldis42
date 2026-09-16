/**
 * @description Converts an unknown value into a plain record when possible.
 * Returns an empty record for unsupported values.
 *
 * @param value - Value to inspect.
 * @returns The value as a string-keyed record or an empty record.
 */
function asRecord(value: unknown): Record<string, unknown> {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return {};
  }

  return value as Record<string, unknown>;
}

export { asRecord };
