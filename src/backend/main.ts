import * as AWS from 'aws-sdk';
import AthenaExpress from 'athena-express';
import { createHash } from 'crypto';
import { v4 as uuidV4 } from 'uuid';
import { assertIs, BackendResponseModel, BackendResponseModelT, FrontendResponseModelT } from '../common/model';
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
export function storeResponseInS3(response: FrontendResponseModelT, countryCode: string) {
  return Promise.resolve()
    .then(() =>
      prepareResponseForStorage(
        response,
        countryCode,
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
  secretPepper: Promise<string>,
  // Allow overriding non-deterministic parts in test code:
  uuid: () => string = uuidV4,
  timestamp = Date.now,
): Promise<BackendResponseModelT> {
  return Promise.resolve(secretPepper).then(secretPepper => {
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
    };
    const model: BackendResponseModelT = { ...meta, ...response, ...meta }; // the double "...meta" is just for vanity: we want the meta-fields to appear first in the JSON representation
    return assertIs(BackendResponseModel)(model); // ensure we still pass runtime validations as well
  });
}

// Produces the key under which this response should be stored in S3
export function getStorageKey(response: BackendResponseModelT): string {
  const [date, time] = response.timestamp.split('T');
  return `responses/raw/${date}/${time}/${response.response_id}.json`;
}

// @example hash("whatever", "secret") => "K/FwCDUHL3iVb9JAMBdSEurw4rWuO/iJmcIWCn2B++s="
function hash(input: string, pepper: string) {
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

  const cityLevelData = await mapPostalCodeLevelToPostalCodeLevelData(postalCodeLevelDataResponse.Items, bucket);

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

async function mapPostalCodeLevelToPostalCodeLevelData(postalCodeLevelData: any[], bucket: string) {
  const postalCodeCityMappings = await s3GetJsonHelper({ Bucket: bucket, Key: 'postalcode_city_mappings.json' });

  const populationPerCity = await s3GetJsonHelper({ Bucket: bucket, Key: 'population_per_city.json' });

  // Turn populationPerCity which is an array into dict keyed by city
  const populationByCityMap = (populationPerCity.data as any[]).reduce((acc, data) => {
    acc[data.city] = data.population;
    return acc;
  }, {});

  // Aggregate of all postal code level data as city level data
  const cityLevelDataAcc: Record<string, any> = {};

  for (const postalCodeData of postalCodeLevelData) {
    const city = postalCodeCityMappings.data[postalCodeData.postal_code] || '';

    // Initialize accumulator data for this key if it doesn't exist yet
    cityLevelDataAcc[city] = cityLevelDataAcc[city] || {
      city,
      population: populationByCityMap[city] || 0,
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

    // Accumulate
    cityLevelDataAcc[city].responses += Number(postalCodeData.responses);
    cityLevelDataAcc[city].fever_no += Number(postalCodeData.fever_no);
    cityLevelDataAcc[city].fever_slight += Number(postalCodeData.fever_slight);
    cityLevelDataAcc[city].fever_high += Number(postalCodeData.fever_high);
    cityLevelDataAcc[city].cough_no += Number(postalCodeData.cough_no);
    cityLevelDataAcc[city].cough_mild += Number(postalCodeData.cough_mild);
    cityLevelDataAcc[city].cough_intense += Number(postalCodeData.cough_intense);
    cityLevelDataAcc[city].general_wellbeing_fine += Number(postalCodeData.general_wellbeing_fine);
    cityLevelDataAcc[city].general_wellbeing_impaired += Number(postalCodeData.general_wellbeing_impaired);
    cityLevelDataAcc[city].general_wellbeing_bad += Number(postalCodeData.general_wellbeing_bad);
    cityLevelDataAcc[city].breathing_difficulties_no += Number(postalCodeData.breathing_difficulties_no);
    cityLevelDataAcc[city].breathing_difficulties_yes += Number(postalCodeData.breathing_difficulties_yes);
    cityLevelDataAcc[city].muscle_pain_no += Number(postalCodeData.muscle_pain_no);
    cityLevelDataAcc[city].muscle_pain_yes += Number(postalCodeData.muscle_pain_yes);
    cityLevelDataAcc[city].headache_no += Number(postalCodeData.headache_no);
    cityLevelDataAcc[city].headache_yes += Number(postalCodeData.headache_yes);
    cityLevelDataAcc[city].sore_throat_no += Number(postalCodeData.sore_throat_no);
    cityLevelDataAcc[city].sore_throat_yes += Number(postalCodeData.sore_throat_yes);
    cityLevelDataAcc[city].rhinitis_no += Number(postalCodeData.rhinitis_no);
    cityLevelDataAcc[city].rhinitis_yes += Number(postalCodeData.rhinitis_yes);
    cityLevelDataAcc[city].stomach_issues_no += Number(postalCodeData.stomach_issues_no);
    cityLevelDataAcc[city].stomach_issues_yes += Number(postalCodeData.stomach_issues_yes);
    cityLevelDataAcc[city].sensory_issues_no += Number(postalCodeData.sensory_issues_no);
    cityLevelDataAcc[city].sensory_issues_yes += Number(postalCodeData.sensory_issues_yes);
    cityLevelDataAcc[city].longterm_medication_no += Number(postalCodeData.longterm_medication_no);
    cityLevelDataAcc[city].longterm_medication_yes += Number(postalCodeData.longterm_medication_yes);
    cityLevelDataAcc[city].smoking_no += Number(postalCodeData.smoking_no);
    cityLevelDataAcc[city].smoking_yes += Number(postalCodeData.smoking_yes);
    cityLevelDataAcc[city].corona_suspicion_no += Number(postalCodeData.corona_suspicion_no);
    cityLevelDataAcc[city].corona_suspicion_yes += Number(postalCodeData.corona_suspicion_yes);
  }

  // NOTE: Does this need to be sorted alphabetically by city?
  return Object.values(cityLevelDataAcc);
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
