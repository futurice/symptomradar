import { isRight } from 'fp-ts/lib/Either';
import * as t from 'io-ts';
import { UnionType } from 'io-ts';
import { PathReporter } from 'io-ts/lib/PathReporter';
import { AbuseScore } from '../backend/abuseDetection';
import {
  age,
  cough,
  duration,
  fever,
  gender,
  generalWellbeing,
  iso8601DateString,
  isStringLiteralType,
  notAnswered,
  postalCode,
  uuidString,
  yesOrNo,
} from './io';
import { nonNullable } from './types';

// Because AWS Athena prefers lower-case column names (https://docs.aws.amazon.com/athena/latest/ug/tables-databases-columns-names.html),
// we use snake case for some of these models, instead of camel case (https://en.wikipedia.org/wiki/Letter_case#Special_case_styles).

export const responseFields = {
  fever: fever,
  cough: cough,
  breathing_difficulties: yesOrNo,
  muscle_pain: yesOrNo,
  headache: yesOrNo,
  sore_throat: yesOrNo,
  rhinitis: yesOrNo,
  stomach_issues: yesOrNo,
  sensory_issues: yesOrNo,
  healthcare_contact: yesOrNo,
  general_wellbeing: generalWellbeing,
  longterm_medication: yesOrNo,
  smoking: yesOrNo,
  corona_suspicion: yesOrNo,
  age_group: age,
  gender: gender,
  postal_code: postalCode,
};
export const responseFieldKeys = (Object.keys(responseFields) as any) as Array<keyof typeof responseFields>; // this is theoretically unsafe (https://stackoverflow.com/a/55012175) but practically a lot safer than going with string[] ¯\_(ツ)_/¯

export const FrontendResponseModel = t.strict(
  {
    participant_id: uuidString,
    ...responseFields,
    duration: t.union([duration, notAnswered]),
  },
  'FrontendResponseModel',
);
export type FrontendResponseModelT = t.TypeOf<typeof FrontendResponseModel>;

// Define this sub-object separately so we can check it against the AbuseScore type
const abuse_score: { [key in keyof AbuseScore]: t.NumberC } = {
  source_ip: t.number,
  user_agent: t.number,
  forwarded_for: t.number,
};

export const BackendResponseModel = t.strict(
  {
    response_id: t.string,
    timestamp: iso8601DateString,
    participant_id: t.string, // after hashing, this is no longer uuidString
    app_version: t.string,
    country_code: t.string,
    ...responseFields,
    duration: t.union([t.number, t.null]), // for persistence, let's cast to number
    abuse_score: t.strict(abuse_score),
  },
  'BackendResponseModel',
);
export type BackendResponseModelT = t.TypeOf<typeof BackendResponseModel>;

// Returns a function that either throws, or returns a valid instance of the Model type provided
export function assertIs<C extends t.ExactC<any>>(codec: C): (x: unknown) => t.TypeOf<C> {
  return x => {
    const result = codec.decode(x); // attempt decoding the given value as the Model type
    if (isRight(result)) {
      return result.right;
    } else {
      throw Object.assign(new Error(`Given data does NOT look like a Model of type "${codec.name}"`), {
        errorDetails: PathReporter.report(result),
      });
    }
  };
}

// Defines tuples describing all response fields that are simple unions of string literals.
// @example [
//   [ 'healthcare_contact', [ 'yes', 'no' ] ],
//   [ 'general_wellbeing', [ 'fine', 'impaired', 'bad' ] ],
//   ...
// ]
// What makes these fields special is that their values are easy to GROUP BY, SUM() etc in queries.
export const stringLiteralUnionFields: [string, string[]][] = responseFieldKeys
  .map(key =>
    responseFields[key] instanceof UnionType
      ? ([
          key,
          (responseFields[key] as any).types // TODO: Assert that responseFields[key] is UnionType<Array<LiteralType>> instead (how?), to get rid of the awkward any
            .map((t: unknown) => (isStringLiteralType(t) ? t.value : null))
            .filter(nonNullable),
        ] as [string, string[]])
      : null,
  )
  .filter(nonNullable);

//
// Open data models

export interface OpenDataModel<T> {
  meta: {
    description: string;
    generated: string;
    link: string;
  };
  data: T;
}

export type PostalCodeCityMappings = OpenDataModel<Record<string, string>>;
export type PopulationPerCity = OpenDataModel<
  Array<{
    city: string;
    population: number;
  }>
>;
