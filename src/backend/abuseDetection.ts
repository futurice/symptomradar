import * as AWS from 'aws-sdk';
import { dropRight, flatMap, range } from 'lodash';

const TIME_RANGE_HOURS = 24;
const HOUR_IN_MS = 60 * 60 * 1000;

type AbuseScore = {
  seen_ip_24h: number;
  seen_ua_24h: number;
  seen_ff_24h: number;
};

type Headers = { [name: string]: string };

export function performAbuseDetection(
  sourceIp: string,
  headers: Headers,
  secretPepper: Promise<string>,
  // Allow overriding non-deterministic parts in test code:
  timestamp = Date.now,
): Promise<AbuseScore> {
  return Promise.resolve({
    seen_ip_24h: 0,
    seen_ua_24h: 0,
    seen_ff_24h: 0,
  });
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
