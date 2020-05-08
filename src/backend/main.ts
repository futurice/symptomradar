import { createHash } from 'crypto';
import { readFileSync } from 'fs';
import { v4 as uuidV4 } from 'uuid';
import { assertIs, BackendResponseModel, BackendResponseModelT, FrontendResponseModelT } from '../common/model';
import { AbuseFingerprint, AbuseScore, ABUSE_SCORE_ERROR, performAbuseDetection } from './abuseDetection';
import { getSecret } from './secrets';
import { App } from './app';
import { exportTotalResponses } from './dataExports/totalResponses';
import { exportCityLevelGeneralResults } from './dataExports/cityLevelGeneralResults';
import { exportDailyTotals } from './dataExports/dailyTotals';
import { exportOpenDataIndex } from './dataExports/openDataIndex';
import { exportCityLevelWeeklyGeneralResults } from './dataExports/cityLevelWeeklyGeneralResults';
import { exportPostalCodeLevelGeneralResults } from './dataExports/postalCodeLevelGeneralResults';

export const APP_VERSION = process.env.AWS_EXECUTION_ENV
  ? readFileSync('deployed-app-version', 'utf8').trim() // assume a version file generated by the deploy process when running in Lambda
  : 'master'; // when not, assume local development version

// Due to occasional very high volumes of incoming responses, cache the secret pepper for the lifetime of the Lambda instance
let cachedSecretPepper: undefined | Promise<string>;

// Saves the given response into our storage bucket
export async function storeResponse(
  app: App,
  response: FrontendResponseModelT,
  countryCode: string,
  fingerprint: AbuseFingerprint,
) {
  const r = await prepareResponseForStorage(
    app,
    response,
    countryCode,
    fingerprint,
    (cachedSecretPepper = cachedSecretPepper || getSecret('secret-pepper')),
  );

  console.log('About to store response', r);
  const Bucket = app.constants.storageBucket;
  const Key = getStorageKey(r);
  await app.s3Client
    .putObject({
      Bucket,
      Key,
      Body: JSON.stringify(r),
      ACL: 'private',
    })
    .promise()
    .catch(err =>
      Promise.reject(
        new Error(`Couldn't store response to bucket "${Bucket}" under key "${Key}" (caused by\n${err}\n)`),
      ),
    );
}

// Takes a response from the frontend, scrubs it clean, and adds fields required for storing it
export async function prepareResponseForStorage(
  app: App,
  response: FrontendResponseModelT,
  countryCode: string,
  fingerprint: AbuseFingerprint,
  secretPepper: Promise<string>,
  // Allow overriding non-deterministic parts in test code:
  uuid: () => string = uuidV4,
  timestamp = Date.now,
): Promise<BackendResponseModelT> {
  const secretPepperValue = await secretPepper;
  const { readPromise, writePromise } = performAbuseDetection(app.abuseDetectionDBClient, fingerprint, val =>
    hash(val, secretPepperValue),
  );

  writePromise // we don't really care about the write operation here - it can finish on its own (we only need to handle its possible failure; if it keeps failing we want to know)
    .catch(err => console.log(`Error: Couldn't write abuse score for response (caused by\n${err}\n)`));

  const abuse_score = await readPromise // we only care about the read operation
    .catch(
      (err): AbuseScore => {
        console.log(`Error: Couldn't read abuse score for response; marking with error code (caused by\n${err}\n)`);
        return ABUSE_SCORE_ERROR;
      },
    );

  // to protect the privacy of participants from very small postal code areas, they are merged into larger ones, based on known population data
  const postal_code = await obfuscateLowPopulationPostalCode(app, response.postal_code);

  const meta = {
    response_id: uuid(),
    participant_id: hash(hash(response.participant_id, app.constants.knownPepper), secretPepperValue), // to preserve privacy, hash the participant_id before storing it, so after opening up the dataset, malicious actors can't submit more responses that pretend to belong to a previous participant
    timestamp: new Date(timestamp()) // for security, don't trust browser clock, as it may be wrong or fraudulent
      .toISOString()
      .replace(/:..\..*/, ':00.000Z'), // to preserve privacy, intentionally reduce precision of the timestamp
    app_version: APP_VERSION, // document the app version that was used to process this response
    country_code: countryCode,
    postal_code,
    duration: response.duration === null ? null : parseInt(response.duration),
    abuse_score,
  };
  const model: BackendResponseModelT = { ...meta, ...response, ...meta }; // the double "...meta" is just for vanity: we want the meta-fields to appear first in the JSON representation
  return assertIs(BackendResponseModel)(model); // ensure we still pass runtime validations as well
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

export async function obfuscateLowPopulationPostalCode(app: App, postalCode: string) {
  try {
    const lowPopulationPostalCodes = await app.s3Sources.fetchLowPopulationPostalCodes();
    return lowPopulationPostalCodes?.data?.[postalCode] || postalCode;
  } catch (err) {
    throw new Error(`Couldn't obfuscate low population postal code "${postalCode}" (caused by\n${err}\n)`);
  }
}

export async function exportOpenData(app: App) {
  await Promise.all([
    // prettier-ignore
    exportTotalResponses(app),
    exportCityLevelGeneralResults(app),
    exportCityLevelWeeklyGeneralResults(app),
    exportPostalCodeLevelGeneralResults(app),
    exportDailyTotals(app),
  ]);

  await exportOpenDataIndex(app);
}
