import AthenaExpress from 'athena-express';
import * as AWS from 'aws-sdk';
import { createHash } from 'crypto';
import { v4 as uuidV4 } from 'uuid';
import { assertIs, BackendResponseModel, BackendResponseModelT, FrontendResponseModelT } from '../common/model';
import {
  AbuseFingerprint,
  AbuseScore,
  ABUSE_SCORE_ERROR,
  DynamoDBClient,
  performAbuseDetection,
} from './abuseDetection';
import { mapPostalCode } from './postalCode';
import { getSecret } from './secrets';
import { totalResponsesQuery, postalCodeLevelDataQuery } from './queries';

const s3: AWS.S3 = new AWS.S3({ apiVersion: '2006-03-01' });
const storageBucket = process.env.BUCKET_NAME_STORAGE || '';
const athenaResultsBucket = process.env.BUCKET_NAME_ATHENA_RESULTS || '';
const knownPepper = process.env.KNOWN_HASHING_PEPPER || '';

// Crash and burn immediately (instead of at first request) for invalid configuration
if (!storageBucket) throw new Error('Storage bucket name missing from environment');
if (!athenaResultsBucket) throw new Error('Athena results bucket name missing from environment');
if (!knownPepper) throw new Error('Hashing pepper missing from environment');

const athenaExpress = new AthenaExpress({ aws: AWS, s3: `s3://${athenaResultsBucket}` });

// Due to occasional very high volumes of incoming responses, cache the secret pepper for the lifetime of the Lambda instance
let cachedSecretPepper: undefined | Promise<string>;

// Saves the given response into our storage bucket
export function storeResponse(
  response: FrontendResponseModelT,
  countryCode: string,
  dynamoDb: DynamoDBClient,
  fingerprint: AbuseFingerprint,
) {
  return Promise.resolve()
    .then(() =>
      prepareResponseForStorage(
        response,
        countryCode,
        dynamoDb,
        fingerprint,
        (cachedSecretPepper = cachedSecretPepper || getSecret('secret-pepper')),
      ),
    )
    .then(r => {
      console.log('About to store response', r);
      return s3
        .putObject({
          Bucket: storageBucket,
          Key: getStorageKey(r),
          Body: JSON.stringify(r),
          ACL: 'private',
        })
        .promise();
    })
    .then(() => {}); // don't promise any value, just the success of the operation
}

// Takes a response from the frontend, scrubs it clean, and adds fields required for storing it
export function prepareResponseForStorage(
  response: FrontendResponseModelT,
  countryCode: string,
  dynamoDb: DynamoDBClient,
  fingerprint: AbuseFingerprint,
  secretPepper: Promise<string>,
  // Allow overriding non-deterministic parts in test code:
  uuid: () => string = uuidV4,
  timestamp = Date.now,
): Promise<BackendResponseModelT> {
  return Promise.resolve(secretPepper).then(secretPepper => {
    const { readPromise, writePromise } = performAbuseDetection(dynamoDb, fingerprint, val => hash(val, secretPepper));
    writePromise // we don't really care about the write operation here - it can finish on its own (we only need to handle its possible failure; if it keeps failing we want to know)
      .catch(err => console.log(`Error: Couldn't write abuse score for response (caused by\n${err}\n)`));
    return readPromise // we only care about the read operation
      .catch(
        (err): AbuseScore => {
          console.log(`Error: Couldn't read abuse score for response; marking with error code (caused by\n${err}\n)`);
          return ABUSE_SCORE_ERROR;
        },
      )
      .then(abuse_score => {
        const meta = {
          response_id: uuid(),
          participant_id: hash(hash(response.participant_id, knownPepper), secretPepper), // to preserve privacy, hash the participant_id before storing it, so after opening up the dataset, malicious actors can't submit more responses that pretend to belong to a previous participant
          timestamp: new Date(timestamp()) // for security, don't trust browser clock, as it may be wrong or fraudulent
            .toISOString()
            .replace(/:..\..*/, ':00.000Z'), // to preserve privacy, intentionally reduce precision of the timestamp
          app_version: 'v2.2', // TODO: This should be set by the deploy process, not hard-coded!
          country_code: countryCode,
          postal_code: mapPostalCode(response).postal_code, // to protect the privacy of participants from very small postal code areas, they are merged into larger ones, based on known population data
          duration: response.duration === null ? null : parseInt(response.duration),
          abuse_score,
        };
        const model: BackendResponseModelT = { ...meta, ...response, ...meta }; // the double "...meta" is just for vanity: we want the meta-fields to appear first in the JSON representation
        return assertIs(BackendResponseModel)(model); // ensure we still pass runtime validations as well
      });
  });
}

// Produces the key under which this response should be stored in S3
export function getStorageKey(response: BackendResponseModelT): string {
  const [date, time] = response.timestamp.split('T');
  return `responses/raw/${date}/${time}/${response.response_id}.json`;
}

// @example hash("whatever", "secret") => "K/FwCDUHL3iVb9JAMBdSEurw4rWuO/iJmcIWCn2B++s="
export function hash(input: string, pepper: string) {
  if (!pepper) throw new Error(`No pepper provided for hashing; while possible, this is likely a configuration error`);
  return createHash('sha256')
    .update(input + pepper)
    .digest('base64');
}

export async function storeDataDumpsToS3() {
  //
  // Validations

  const db = process.env.ATHENA_DB_NAME;
  if (!db) throw new Error('Athena DB name missing from environment');
  const bucket = process.env.BUCKET_NAME_OPEN_DATA;
  if (!bucket) throw new Error('Open data bucket name missing from environment');
  const domain = process.env.DOMAIN_NAME_OPEN_DATA;
  if (!domain) throw new Error('Open data domain name missing from environment');

  //
  // Perform Athena queries in parallel

  const [totalResponsesResult, postalCodeLevelDataResponse] = await Promise.all([
    athenaExpress.query({ sql: totalResponsesQuery, db }),
    athenaExpress.query({ sql: postalCodeLevelDataQuery, db }),
  ]);

  //
  // Map query results into the JSON format we want to see in s3

  // TODO: Add model for this
  const totalResponses = totalResponsesResult.Items[0];

  const cityLevelData = await mapPostalCodeLevelToCityLevelData(postalCodeLevelDataResponse.Items, bucket);

  //
  // Push data to S3

  await Promise.all([
    s3PutJsonHelper({
      Bucket: bucket,
      Key: 'total_responses.json',
      Body: {
        meta: {
          description:
            'Total number of responses collected by the system thus far. This is the raw number before any filtering or abuse detection has been performed.',
          generated: new Date().toISOString(),
          link: `https://${domain}/total_responses.json`,
        },
        data: totalResponses,
      },
    }),

    s3PutJsonHelper({
      Bucket: bucket,
      Key: 'city_level_general_results.json',
      Body: {
        meta: {
          description:
            'Population and response count per each city in Finland, where the response count was higher than 25. All the form inputs are coded in city level. Population data from Tilastokeskus. This data is released for journalistic and scientific purposes.',
          generated: new Date().toISOString(),
          link: `https://${domain}/city_level_general_results.json`,
        },
        data: cityLevelData,
      },
    }),
  ]);
}

const openDataFileNames = [
  'city_level_general_results',
  'low_population_postal_codes',
  'population_per_city',
  'postalcode_city_mappings',
  'topojson_finland_simplified',
  'topojson_finland_without_aland',
];

export async function updateOpenDataIndex() {
  //
  // Validate environment

  const bucket = process.env.BUCKET_NAME_OPEN_DATA;
  if (!bucket) throw new Error('Open data bucket name missing from environment');
  const domain = process.env.DOMAIN_NAME_OPEN_DATA;
  if (!domain) throw new Error('Open data domain name missing from environment');

  //
  // Fetch data files

  // TODO: Model these (meta: OpenDataMeta, data: T = any)
  const openDataIndex: Record<string, any> = {};

  for (const filename of openDataFileNames) {
    const data = await s3GetJsonHelper({ Bucket: bucket, Key: `${filename}.json` });
    openDataIndex[filename] = data.meta;
  }

  const openData = {
    meta: {
      description: 'This is the open data site for the www.oiretutka.fi project',
    },
    data: openDataIndex,
  };

  await s3PutJsonHelper({ Bucket: bucket, Key: 'index.json', Body: openData });
}

async function mapPostalCodeLevelToCityLevelData(postalCodeLevelData: any[], bucket: string) {
  const postalCodeCityMappings = await s3GetJsonHelper({ Bucket: bucket, Key: 'postalcode_city_mappings.json' });

  const populationPerCity = await s3GetJsonHelper({ Bucket: bucket, Key: 'population_per_city.json' });

  // Generate initial city-level aggregation set from the city population data
  const resultsByCity = (populationPerCity.data as any[]).reduce((acc, data) => {
    acc[data.city] = {
      city: data.city,
      population: data.population,
      responses: 0,
      fever_no: 0,
      fever_slight: 0,
      fever_high: 0,
      cough_no: 0,
      cough_mild: 0,
      cough_intense: 0,
      general_wellbeing_fine: 0,
      general_wellbeing_impaired: 0,
      general_wellbeing_bad: 0,
      breathing_difficulties_no: 0,
      breathing_difficulties_yes: 0,
      muscle_pain_no: 0,
      muscle_pain_yes: 0,
      headache_no: 0,
      headache_yes: 0,
      sore_throat_no: 0,
      sore_throat_yes: 0,
      rhinitis_no: 0,
      rhinitis_yes: 0,
      stomach_issues_no: 0,
      stomach_issues_yes: 0,
      sensory_issues_no: 0,
      sensory_issues_yes: 0,
      longterm_medication_no: 0,
      longterm_medication_yes: 0,
      smoking_no: 0,
      smoking_yes: 0,
      corona_suspicion_no: 0,
      corona_suspicion_yes: 0,
    };
    return acc;
  }, {});

  // Accumulate postal code level data into city level data
  for (const postalCodeData of postalCodeLevelData) {
    const city = postalCodeCityMappings.data[postalCodeData.postal_code];

    if (!city) {
      console.warn(`mapPostalCodeLevelToCityLevelData: Skipping unknown postal code ${postalCodeData.postal_code}`);
      continue;
    }

    resultsByCity[city].responses += Number(postalCodeData.responses);
    resultsByCity[city].fever_no += Number(postalCodeData.fever_no);
    resultsByCity[city].fever_slight += Number(postalCodeData.fever_slight);
    resultsByCity[city].fever_high += Number(postalCodeData.fever_high);
    resultsByCity[city].cough_no += Number(postalCodeData.cough_no);
    resultsByCity[city].cough_mild += Number(postalCodeData.cough_mild);
    resultsByCity[city].cough_intense += Number(postalCodeData.cough_intense);
    resultsByCity[city].general_wellbeing_fine += Number(postalCodeData.general_wellbeing_fine);
    resultsByCity[city].general_wellbeing_impaired += Number(postalCodeData.general_wellbeing_impaired);
    resultsByCity[city].general_wellbeing_bad += Number(postalCodeData.general_wellbeing_bad);
    resultsByCity[city].breathing_difficulties_no += Number(postalCodeData.breathing_difficulties_no);
    resultsByCity[city].breathing_difficulties_yes += Number(postalCodeData.breathing_difficulties_yes);
    resultsByCity[city].muscle_pain_no += Number(postalCodeData.muscle_pain_no);
    resultsByCity[city].muscle_pain_yes += Number(postalCodeData.muscle_pain_yes);
    resultsByCity[city].headache_no += Number(postalCodeData.headache_no);
    resultsByCity[city].headache_yes += Number(postalCodeData.headache_yes);
    resultsByCity[city].sore_throat_no += Number(postalCodeData.sore_throat_no);
    resultsByCity[city].sore_throat_yes += Number(postalCodeData.sore_throat_yes);
    resultsByCity[city].rhinitis_no += Number(postalCodeData.rhinitis_no);
    resultsByCity[city].rhinitis_yes += Number(postalCodeData.rhinitis_yes);
    resultsByCity[city].stomach_issues_no += Number(postalCodeData.stomach_issues_no);
    resultsByCity[city].stomach_issues_yes += Number(postalCodeData.stomach_issues_yes);
    resultsByCity[city].sensory_issues_no += Number(postalCodeData.sensory_issues_no);
    resultsByCity[city].sensory_issues_yes += Number(postalCodeData.sensory_issues_yes);
    resultsByCity[city].longterm_medication_no += Number(postalCodeData.longterm_medication_no);
    resultsByCity[city].longterm_medication_yes += Number(postalCodeData.longterm_medication_yes);
    resultsByCity[city].smoking_no += Number(postalCodeData.smoking_no);
    resultsByCity[city].smoking_yes += Number(postalCodeData.smoking_yes);
    resultsByCity[city].corona_suspicion_no += Number(postalCodeData.corona_suspicion_no);
    resultsByCity[city].corona_suspicion_yes += Number(postalCodeData.corona_suspicion_yes);
  }

  // NOTE: v8 should maintain insertion order here, and since the original
  // data this is derived from arranges cities in alphabetical order,
  // this should be alphabetically ordered as well.
  return Object.values(resultsByCity);
}

//
// S3 helpers

async function s3GetJsonHelper(params: AWS.S3.GetObjectRequest) {
  const result = await s3.getObject(params).promise();
  if (!result.Body) {
    throw Error(`Empty JSON in S3 object '${params.Bucket}/${params.Key}`);
  }

  return JSON.parse(result.Body.toString('utf-8'));
}

async function s3PutJsonHelper(params: AWS.S3.PutObjectRequest) {
  return await s3
    .putObject({
      ...params,
      ContentType: 'application/json',
      CacheControl: 'max-age=15',
      Body: JSON.stringify(params.Body, null, 2),
    })
    .promise();
}
