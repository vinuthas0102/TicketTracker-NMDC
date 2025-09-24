// UUID validation and generation utilities

/**
 * Validates if a string is a valid UUID v4 format
 */
export function isValidUUID(uuid: string): boolean {
  // Accept any valid UUID format (v1, v3, v4, v5) - not just v4
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
}

/**
 * Generates a valid UUID v4
 */
export function generateUUID(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

export function isValidUUIDv4(uuid: string): boolean {
  // Strict v4 validation for new UUID generation validation
  const uuidv4Regex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidv4Regex.test(uuid);
}

/**
 * Sanitizes a UUID by generating a new one if invalid
 */
export function sanitizeUUID(uuid: string): string {
  return isValidUUID(uuid) ? uuid : generateUUID();
}

/**
 * Validates and throws error if UUID is invalid
 */
export function validateUUID(uuid: string, fieldName: string = 'UUID'): void {
  if (!isValidUUID(uuid)) {
    throw new Error(`Invalid ${fieldName} format: ${uuid}`);
  }
}