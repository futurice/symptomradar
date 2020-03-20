import * as t from 'io-ts';

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/;

export const uuidString = new t.Type<string, string, unknown>(
  // A unique name for this codec:
  'uuidString',
  // A custom type guard:
  (input: unknown): input is string => typeof input === 'string' && !!input.match(UUID_PATTERN),
  // Succeeds if a value of type I can be decoded to a value of type A:
  (input, context) =>
    typeof input === 'string' && !!input.match(UUID_PATTERN) ? t.success(input) : t.failure(input, context),
  // Converts a value of type A to a value of type O:
  t.identity,
);
