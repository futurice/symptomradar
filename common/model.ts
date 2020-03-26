import { isRight } from 'fp-ts/lib/Either';
import * as t from 'io-ts';
import { PathReporter } from 'io-ts/lib/PathReporter';
import {
  iso8601DateString,
  postalCode,
  gender,
  fever,
  cough,
  yesOrNo,
  generalWellbeing,
  duration,
  age,
  notAnswered,
} from './io';

// Because AWS Athena prefers lower-case column names (https://docs.aws.amazon.com/athena/latest/ug/tables-databases-columns-names.html),
// we use snake case for some of these models, instead of camel case (https://en.wikipedia.org/wiki/Letter_case#Special_case_styles).

export const ResponseModel = t.strict(
  {
    // Metadata:
    participant_uuid: t.string, // TODO: This can be uuidString when we have separate models for response from browser, and response scrubbed by backend
    timestamp: iso8601DateString,
    // Payload:
    fever: t.union([fever, notAnswered]),
    cough: t.union([cough, notAnswered]),
    breathing_difficulties: t.union([yesOrNo, notAnswered]),
    muscle_pain: t.union([yesOrNo, notAnswered]),
    headache: t.union([yesOrNo, notAnswered]),
    sore_throat: t.union([yesOrNo, notAnswered]),
    rhinitis: t.union([yesOrNo, notAnswered]),
    general_wellbeing: t.union([generalWellbeing, notAnswered]),
    duration: t.union([duration, notAnswered]),
    longterm_medication: t.union([yesOrNo, notAnswered]),
    smoking: t.union([yesOrNo, notAnswered]),
    corona_suspicion: t.union([yesOrNo, notAnswered]),
    age_group: t.union([age, notAnswered]),
    gender: t.union([gender, notAnswered]),
    postal_code: t.union([postalCode, notAnswered]),
  },
  'ResponseModel',
);

export type ResponseModelT = t.TypeOf<typeof ResponseModel>;

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
