import * as AWS from 'aws-sdk';
import { dropRight, flatMap, mapValues, range } from 'lodash';
import { HOUR_IN_MS } from '../common/time';
import { nonNullable } from '../common/types';

const TIME_RANGE_HOURS = 24;

export type AbuseFingerprint = {
  source_ip: string;
  user_agent: string;
  forwarded_for: string;
};
export type AbuseScore = {
  [key in keyof AbuseFingerprint]: number;
};

const emptyScore: AbuseScore = { source_ip: 0, user_agent: 0, forwarded_for: 0 };
const fingerprintKeys = (Object.keys(emptyScore) as any) as Array<keyof AbuseFingerprint>;

// Reads & updates DynamoDB to keep track of our abuse detection metrics.
// Promises the "abuse score" for the given fingerprint (i.e. request).
// The read/write Promises are returned separately, so that client requests can be serviced immediately after reading the current abuse score finishes.
// Thus the client doesn't need to wait for the writes to finish; those can happen after the client's already gotten its response.
export function performAbuseDetection(
  dynamoDb: DynamoDBClient,
  fingerprint: AbuseFingerprint,
  hashFunction: (input: string) => string,
  // Allow overriding defaults in test code:
  timestamp = Date.now,
  timeRangeHours = TIME_RANGE_HOURS,
) {
  const now = timestamp();
  const timeRange = getTimeRange(now, timeRangeHours);
  const fp = mapValues(fingerprint, v => (v ? hashFunction(v) : '')); // to preserve privacy, put all values (e.g. IP, UA) through a one-way hash function before doing anything with them (keep empty strings as empty, though, since they warrant special treatment later)
  const keysToGet = flatMap(fingerprintKeys, key => timeRange.map(ts => getStorageKey(key, fp[key], ts)));
  const keysToIncrement = fingerprintKeys
    .map(key => (fp[key] ? getStorageKey(key, fp[key], now) : null))
    .filter(nonNullable);
  const resultKeys = flatMap(fingerprintKeys, key => timeRange.map(() => key)); // e.g. [ 'source_ip', 'source_ip', 'source_ip', 'user_agent', 'user_agent', 'user_agent', ...
  const tallyAbuseScore = (obj: AbuseScore, key: keyof AbuseScore, num: number) => ({ ...obj, [key]: obj[key] + num });
  const readPromise = dynamoDb.getValues(keysToGet).then(res =>
    res.reduce(
      (memo, next, i) => tallyAbuseScore(memo, resultKeys[i], next), // correlate each result with its corresponding fingerprint key (from resultKeys) and increment the relevant field in the score object
      { ...emptyScore }, // start with an empty score
    ),
  );
  const writePromise = readPromise.then(
    () => Promise.all(keysToIncrement.map(dynamoDb.incrementKey)), // after we're done reading, ask DynamoDB to increment the relevant keys
  );
  return { readPromise, writePromise };
}

// Creates a specialized DynamoDB API wrapper for reading/writing abuse detection related data
export function createDynamoDbClient(tableName: string, ttlSeconds: number) {
  var ddb = new AWS.DynamoDB({ apiVersion: '2012-08-10' }); // note: for local development, you may need to: AWS.config.update({ region: 'eu-west-1' });
  return {
    // Increments the integer value at given key.
    // If the key doesn't exist, it's created automatically as having value 0, then incremented normally.
    // Returns the integer value (after being incremented).
    incrementKey(key: string): Promise<number> {
      return ddb
        .updateItem({
          TableName: tableName,
          Key: { ADKey: { S: key } },
          UpdateExpression: 'SET ADVal = if_not_exists(ADVal, :init) + :inc, ADTtl = :ttl',
          ExpressionAttributeValues: {
            ':inc': { N: '1' },
            ':init': { N: '0' },
            ':ttl': { N: Math.round((Date.now() + 1000 * ttlSeconds) / 1000) + '' },
          },
          ReturnValues: 'UPDATED_NEW',
        })
        .promise()
        .then(res => res?.Attributes?.ADVal)
        .then(unwrapNumber);
    },

    // Returns the integer values at given keys.
    // If some keys don't contain values, they're treated as 0's.
    getValues(keys: string[]): Promise<number[]> {
      return ddb
        .batchGetItem({
          RequestItems: {
            [tableName]: {
              AttributesToGet: ['ADKey', 'ADVal'],
              Keys: keys.map(key => ({ ADKey: { S: key } })),
            },
          },
        })
        .promise()
        .then(res =>
          (res?.Responses?.[tableName] || []).reduce(
            (memo, next) => ({ ...memo, [next.ADKey.S || '']: unwrapNumber(next.ADVal) }),
            {} as { [key: string]: number },
          ),
        )
        .then(res => keys.map(key => res[key] || 0));
    },
  };
}
export type DynamoDBClient = ReturnType<typeof createDynamoDbClient>;

// See interface AttributeValue in DynamoDB
function unwrapNumber(attrValue?: { N?: string }): number {
  const num = parseInt(attrValue?.N || '', 10);
  if (Number.isFinite(num)) return num;
  throw new Error(`Unexpected number value from DynamoDB: "${attrValue?.N}"`);
}

// Returns the key under which this key/value pair should be tracked in DynamoDB
export function getStorageKey(propertyName: string, propertyValue: string, ts: number) {
  const hour = new Date(ts).toISOString().replace(/:.*Z/, 'Z'); // to preserve privacy, intentionally reduce precision of the timestamp
  return `${hour}/${propertyName}/${propertyValue}`;
}

// Returns the timestamps, 1 hour apart, that cover the whole time range over which we perform abuse detection
export function getTimeRange(
  ts: number,
  // Allow overriding defaults in test code:
  timeRangeHours = TIME_RANGE_HOURS,
) {
  return range(ts - (timeRangeHours - 1) * HOUR_IN_MS, ts + 1, HOUR_IN_MS);
}

// Drops the last 2 items in a standard-formatted 'X-Forwarded-For' header; in our use case, those are:
// 1) The "real" IP of the client, which we get via other means
// 2) The CloudFront edge node via which the request was routed
// What we're instead interested in is whether there's something IN ADDITION to those in this header
export function normalizeForwardedFor(value?: string) {
  return dropRight((value || '').split(', '), 2).join(', ');
}
