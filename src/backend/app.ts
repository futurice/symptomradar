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
  validateEnvironmentVariables(process.env, ['DOMAIN_NAME_OPEN_DATA', 'KNOWN_HASHING_PEPPER', 'ATHENA_DB_NAME']);

  return {
    domainName: process.env.DOMAIN_NAME_OPEN_DATA!,
    knownPepper: process.env.KNOWN_HASHING_PEPPER!,
    athenaDb: process.env.ATHENA_DB_NAME!,
    lowPopulationPostalCodesKey: 'low_population_postal_codes.json',
  };
}

//
// S3 buckets

export function createS33BucketSources() {
  validateEnvironmentVariables(process.env, [
    'BUCKET_NAME_STORAGE',
    'BUCKET_NAME_OPEN_DATA',
    'BUCKET_NAME_ATHENA_RESULTS',
  ]);

  return {
    storage: process.env.BUCKET_NAME_STORAGE!,
    openData: process.env.BUCKET_NAME_OPEN_DATA!,
    athenaResults: process.env.BUCKET_NAME_ATHENA_RESULTS!,
  };
}

export type S3BucketSources = ReturnType<typeof createS33BucketSources>;

//
// S3 client

export function createS3Client() {
  return new AWS.S3({ apiVersion: '2006-03-01' });
}

//
// Athena client

export function createAthenaClient(s3Buckets: S3BucketSources) {
  return new AthenaExpress({ aws: AWS, s3: `s3://${s3Buckets.athenaResults}` });
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
  validateEnvironmentVariables(process.env, ['ABUSE_DETECTION_TABLE']);

  const constants = createAppConstants();
  const s3Buckets = createS33BucketSources();
  const dynamoDbClient = createDynamoDbClient();

  const app = {
    constants,
    s3Buckets,
    s3Client: createS3Client(),
    athenaClient: createAthenaClient(s3Buckets),
    dynamoDbClient,
    ssmClient: createSsmClient(),
    abuseDetectionDBClient: createAbuseDetectionDbClient(dynamoDbClient, process.env.ABUSE_DETECTION_TABLE!),
  };

  return app;
}

export type App = ReturnType<typeof createApp>;
