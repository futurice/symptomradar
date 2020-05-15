/**
 * TODO: Consider placing this to src/backend/__mocks__/app.ts
 * @see https://jestjs.io/docs/en/manual-mocks.html#mocking-user-modules
 */

import { App, S3Sources } from './app';
import { AbuseDetectionDbClient } from './abuseDetection';

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

export function createMockS3Sources(overrides: Partial<S3Sources> = {}) {
  async function defaultMock(): Promise<any> {
    return {};
  }

  return {
    fetchLowPopulationPostalCodes: overrides.fetchLowPopulationPostalCodes || defaultMock,
    fetchPopulationPerCity: overrides.fetchPopulationPerCity || defaultMock,
    fetchPostalCodeCityMappings: overrides.fetchPostalCodeCityMappings || defaultMock,
    fetchPostalCodeAreas: overrides.fetchPostalCodeAreas || defaultMock,
  };
}

export function createMockAbuseDetectionDbClient(
  overrides: Partial<AbuseDetectionDbClient> = {},
): AbuseDetectionDbClient & {
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
    domainName: process.env.DOMAIN_NAME_OPEN_DATA!,
    knownPepper: process.env.KNOWN_HASHING_PEPPER!,
    athenaDb: process.env.ATHENA_DB_NAME!,
    abuseDetectionTable: process.env.ABUSE_DETECTION_TABLE!,
    // Bucket names
    storageBucket: process.env.BUCKET_NAME_STORAGE!,
    openDataBucket: process.env.BUCKET_NAME_OPEN_DATA!,
    athenaResultsBucket: process.env.BUCKET_NAME_ATHENA_RESULTS!,
    // Bucket key names
    lowPopulationPostalCodesKey: 'low_population_postal_codes.json',
    populationPerCityKey: 'population_per_city.json',
    postalCodeAreasKey: 'postalcode_areas.json',
    postalCodeCityMappingsKey: 'postalcode_city_mappings.json',
    topoJsonFinlandSimplifiedKey: 'topojson_finland_simplified.json',
    topoJsonFinlandWithoutAlandKey: 'topojson_finland_without_aland.json',
    // Data dump bucket keys
    openDataIndexKey: 'index.json',
    totalResponsesKey: 'total_responses.json',
    cityLevelGeneralResultsKey: 'city_level_general_results.json',
    cityLevelPastWeekGeneralResultsKey: 'city_level_past_week_general_results.json',
    postalCodeLevelGeneralResultsKey: 'postalcode_level_general_results.json',
    dailyTotalsKey: 'daily_totals.json',
    responsesFullKey: 'responses_full.json',
  };

  const mockApp: App = {
    constants,
    s3Client: overrides.s3Client || notImplemented<App['s3Client']>(),
    s3Sources: overrides.s3Sources || createMockS3Sources(),
    athenaClient: overrides.athenaClient || notImplemented<App['athenaClient']>(),
    dynamoDbClient: overrides.dynamoDbClient || notImplemented<App['dynamoDbClient']>(),
    ssmClient: overrides.ssmClient || notImplemented<App['ssmClient']>(),
    abuseDetectionDBClient: overrides.abuseDetectionDBClient || createMockAbuseDetectionDbClient(),
  };

  return mockApp;
}
