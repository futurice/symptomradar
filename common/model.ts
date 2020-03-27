import { isRight } from 'fp-ts/lib/Either';
import * as t from 'io-ts';
import { PathReporter } from 'io-ts/lib/PathReporter';
import {
  age,
  cough,
  duration,
  fever,
  gender,
  generalWellbeing,
  iso8601DateString,
  notAnswered,
  postalCode,
  uuidString,
  yesOrNo,
} from './io';

// Because AWS Athena prefers lower-case column names (https://docs.aws.amazon.com/athena/latest/ug/tables-databases-columns-names.html),
// we use snake case for some of these models, instead of camel case (https://en.wikipedia.org/wiki/Letter_case#Special_case_styles).

const responseFields = {
  fever: fever,
  cough: cough,
  breathing_difficulties: yesOrNo,
  muscle_pain: yesOrNo,
  headache: yesOrNo,
  sore_throat: yesOrNo,
  rhinitis: yesOrNo,
  stomach_issues: yesOrNo,
  sensory_issues: yesOrNo,
  general_wellbeing: generalWellbeing,
  longterm_medication: yesOrNo,
  smoking: yesOrNo,
  corona_suspicion: yesOrNo,
  age_group: age,
  gender: gender,
  postal_code: postalCode,
};

export const FrontendResponseModel = t.strict(
  {
    participant_id: uuidString,
    ...responseFields,
    duration: t.union([duration, notAnswered]),
  },
  'FrontendResponseModel',
);
export type FrontendResponseModelT = t.TypeOf<typeof FrontendResponseModel>;

export const BackendResponseModel = t.strict(
  {
    response_id: t.string,
    timestamp: iso8601DateString,
    participant_id: t.string, // after hashing, this is no longer uuidString
    app_version: t.string,
    ...responseFields,
    duration: t.union([t.number, t.null]), // for persistence, let's cast to number
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
