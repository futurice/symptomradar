import * as AWS from 'aws-sdk';
import AthenaExpress from 'athena-express';
import { createAbuseDetectionDbClient } from './abuseDetection';

//
// Utils

function validateEnvironmentVariables(env: Record<string, string | undefined>, keys: string[]) {
  for (const key of keys) {
    if (!env[key]) {
      throw new Error(`${key} missing from environment`);
    }
  }
}

//
// Constants

export function createAppConstants() {
  validateEnvironmentVariables(process.env, [
    'DOMAIN_NAME_OPEN_DATA',
    'KNOWN_HASHING_PEPPER',
    'ATHENA_DB_NAME',
    'ABUSE_DETECTION_TABLE',
  ]);

  return {
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
    postalCodeCityMappingsKey: 'postalcode_city_mappings.json',
  };
}

export type AppConstants = ReturnType<typeof createAppConstants>;

//
// S3 client

export function createS3Client() {
  return new AWS.S3({ apiVersion: '2006-03-01' });
}

//
// S3 fetch helpers

export async function s3GetJsonHelper(s3: AWS.S3, params: AWS.S3.GetObjectRequest) {
  const result = await s3.getObject(params).promise();
  if (!result.Body) {
    throw Error(`Empty JSON in S3 object '${params.Bucket}/${params.Key}`);
  }

  return JSON.parse(result.Body.toString('utf-8'));
}

export async function s3PutJsonHelper(s3: AWS.S3, params: AWS.S3.PutObjectRequest) {
  return await s3
    .putObject({
      ...params,
      ContentType: 'application/json',
      CacheControl: 'max-age=15',
      Body: JSON.stringify(params.Body, null, 2),
    })
    .promise();
}

export function createS3Sources(appConstants: AppConstants, s3Client: AWS.S3) {
  return {
    fetchLowPopulationPostalCodes() {
      return s3GetJsonHelper(s3Client, {
        Bucket: appConstants.openDataBucket,
        Key: appConstants.lowPopulationPostalCodesKey,
      });
    },

    fetchPopulationPerCity() {
      return s3GetJsonHelper(s3Client, {
        Bucket: appConstants.openDataBucket,
        Key: appConstants.populationPerCityKey,
      });
    },

    fetchPostalCodeCityMappings() {
      return s3GetJsonHelper(s3Client, {
        Bucket: appConstants.openDataBucket,
        Key: appConstants.postalCodeCityMappingsKey,
      });
    },
  };
}

export type S3Sources = ReturnType<typeof createS3Sources>;

//
// Athena client

export function createAthenaClient(appConstants: AppConstants) {
  return new AthenaExpress({ aws: AWS, s3: `s3://${appConstants.athenaResultsBucket}` });
}

//
// DynamoDB client

export function createDynamoDbClient() {
  return new AWS.DynamoDB({ apiVersion: '2012-08-10' }); // note: for local development, you may need to: AWS.config.update({ region: 'eu-west-1' });
}

//
// SSM client

export function createSsmClient() {
  return new AWS.SSM();
}

export function createApp() {
  const constants = createAppConstants();
  const s3Client = createS3Client();
  const dynamoDbClient = createDynamoDbClient();

  const app = {
    constants,
    s3Client,
    s3Sources: createS3Sources(constants, s3Client),
    athenaClient: createAthenaClient(constants),
    dynamoDbClient,
    ssmClient: createSsmClient(),
    abuseDetectionDBClient: createAbuseDetectionDbClient(dynamoDbClient, constants.abuseDetectionTable),
  };

  return app;
}

export type App = ReturnType<typeof createApp>;
