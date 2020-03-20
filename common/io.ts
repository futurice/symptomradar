import * as t from 'io-ts';

function defineRegexValidatedStringType(name: string, regex: RegExp) {
  const guard = (input: unknown): input is string => typeof input === 'string' && !!input.match(regex);
  return new t.Type<string, string, unknown>(
    name, // a unique name for this codec
    guard, // a custom type guard
    (input, context) => (guard(input) ? t.success(input) : t.failure(input, context)), // succeeds if a value of type I can be decoded to a value of type A
    t.identity, // converts a value of type A to a value of type O
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

// empty string
export const notAnswered = defineRegexValidatedStringType('notAnswered', /^$/);

export const yesOrNo = t.keyof({
  no: null,
  yes: null,
});

// range of 0 - 199 years
export const age = defineRegexValidatedStringType('age', /^[1]{0,1}[0-9]{1,2}$/);

export const gender = t.keyof({
  female: null,
  male: null,
  other: null,
});

// range of 00000 – 99999
export const postCode = defineRegexValidatedStringType('postCode', /^[0-9]{5}$/);

export const feverSymptoms = t.keyof({
  none: null,
  slight: null,
  high: null,
});

export const coughSymptoms = t.keyof({
  none: null,
  mild: null,
  intense: null,
});

export const generalWellbeing = t.keyof({
  fine: null,
  impaired: null,
  bad: null,
});

// range of 0–99 days
export const symptomsDuration = defineRegexValidatedStringType('symptomsDuration', /^[0-9]{2}$/);
