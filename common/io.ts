import * as t from 'io-ts';

function defineRegexValidatedStringType(name: string, regex: RegExp) {
  const guard = (input: unknown): input is string => typeof input === 'string' && !!input.match(regex);
  return new t.Type<string, string, unknown>(
    // A unique name for this codec:
    name,
    // A custom type guard:
    guard,
    // Succeeds if a value of type I can be decoded to a value of type A:
    (input, context) => (guard(input) ? t.success(input) : t.failure(input, context)),
    // Converts a value of type A to a value of type O:
    t.identity,
  );
}

export const uuidString = defineRegexValidatedStringType(
  'uuidString',
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/,
);

export const iso8601DateString = defineRegexValidatedStringType(
  'iso8601DateString', // ...particularly the flavor produced by Date.toISOString()
  /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2})\.(\d{3})Z$/,
);
