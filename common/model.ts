import { isRight } from 'fp-ts/lib/Either';
import * as t from 'io-ts';
import { PathReporter } from 'io-ts/lib/PathReporter';
import {
  uuidString,
  iso8601DateString,
  postCode,
  gender,
  feverSymptoms,
  coughSymptoms,
  yesOrNo,
  generalWellbeing,
  symptomsDuration,
  age,
  notAnswered,
} from './io';

export const ResponseModel = t.exact(
  t.type({
    // Metadata:
    participantUuid: uuidString,
    responseTimestamp: iso8601DateString,
    // Payload:
    age: t.union([age, notAnswered]),
    gender: t.union([gender, notAnswered]),
    location: t.union([postCode, notAnswered]),
    feverSymptoms: t.union([feverSymptoms, notAnswered]),
    coughSymptoms: t.union([coughSymptoms, notAnswered]),
    difficultyBreathing: t.union([yesOrNo, notAnswered]),
    musclePain: t.union([yesOrNo, notAnswered]),
    soreThroat: t.union([yesOrNo, notAnswered]),
    rhinitis: t.union([yesOrNo, notAnswered]),
    generalWellbeing: t.union([generalWellbeing, notAnswered]),
    symptomsDuration: t.union([symptomsDuration, notAnswered]),
    longTermMedication: t.union([yesOrNo, notAnswered]),
    smoking: t.union([yesOrNo, notAnswered]),
    suspectsCorona: t.union([yesOrNo, notAnswered]),
  }),
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
