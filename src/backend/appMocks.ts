/**
 * TODO: Consider placing this to src/backend/__mocks__/app.ts
 * @see https://jestjs.io/docs/en/manual-mocks.html#mocking-user-modules
 */

import { App } from './app';
import { AbuseDetectionDBClient } from './abuseDetection';

function notImplemented<T extends object>(target: any = {}): T {
  const proxy = new Proxy(target, {
    get() {
      throw new Error('Not implemented');
    },
    set() {
      throw new Error('Not implemented');
    },
    apply() {
      throw new Error('Not implemented');
    },
  });

  return proxy;
}

export function createMockAbuseDetectionDbClient(
  overrides: Partial<AbuseDetectionDBClient> = {},
): AbuseDetectionDBClient & {
  _storage: { [key: string]: number | undefined };
} {
  const storage: { [key: string]: number | undefined } = {};
  return {
    incrementKey:
      overrides.incrementKey ||
      function(key: string) {
        return Promise.resolve((storage[key] = (storage[key] || 0) + 1));
      },
    getValues:
      overrides.getValues ||
      function(keys: string[]) {
        return Promise.resolve(keys.map(key => storage[key] || 0));
      },
    _storage: storage,
  };
}

export function createMockApp(overrides: Partial<App> = {}): App {
  const constants = overrides.constants || {
    domainName: 'test',
    athenaDb: 'test',
    knownPepper: process.env.KNOWN_HASHING_PEPPER!,
    lowPopulationPostalCodesKey: 'low_population_postal_codes.json',
  };

  const mockApp: App = {
    constants,
    s3Buckets: overrides.s3Buckets || notImplemented<App['s3Buckets']>(),
    s3Client: overrides.s3Client || notImplemented<App['s3Client']>(),
    athenaClient: overrides.athenaClient || notImplemented<App['athenaClient']>(),
    dynamoDbClient: overrides.dynamoDbClient || notImplemented<App['dynamoDbClient']>(),
    ssmClient: overrides.ssmClient || notImplemented<App['ssmClient']>(),
    abuseDetectionDBClient: overrides.abuseDetectionDBClient || createMockAbuseDetectionDbClient(),
  };

  return mockApp;
}
