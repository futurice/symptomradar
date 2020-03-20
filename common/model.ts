import { isRight } from 'fp-ts/lib/Either';
import { PathReporter } from 'io-ts/lib/PathReporter';
import * as t from 'io-ts';

export const ResponseModel = t.exact(
  t.type({
    // Metadata:
    participantUuid: t.string,
    responseTimestamp: t.string,
    // Payload:
    firstName: t.string,
    favoriteColor: t.union([
      t.literal('red'),
      t.literal('green'),
      t.literal('blue'),
      t.literal('yellow'),
      t.literal('orange'),
      t.literal('cyan'),
      t.literal('purple'),
    ]),
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
