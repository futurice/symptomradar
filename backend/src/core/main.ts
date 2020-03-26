import * as AWS from 'aws-sdk';
import { createHash } from 'crypto';
import { v4 as uuidV4 } from 'uuid';
import { FrontendResponseModelT, StoredResponseModelT } from '../common/model';
import { mapPostalCode } from './postalCode';

const s3: AWS.S3 = new AWS.S3({ apiVersion: '2006-03-01' });
const bucket = process.env.BUCKET_NAME_STORAGE || '';
const pepper = process.env.SECRET_HASHING_PEPPER || '';

// Crash and burn immediately (instead of at first request) for invalid configuration
if (!bucket) throw new Error('Storage bucket name missing from environment');
if (!pepper) throw new Error('Hashing pepper missing from environment');

// Saves the given response into our storage bucket
export function storeResponseInS3(response: FrontendResponseModelT) {
  const r = prepareResponseForStorage(response);
  console.log('About to store response', r);
  return s3
    .putObject({
      Bucket: bucket,
      Key: getStorageKey(r),
      Body: JSON.stringify(r),
      ACL: 'private',
    })
    .promise()
    .then(() => {}); // don't promise any value, just the success of the operation
}

// Takes a response from the frontend, scrubs it clean, and adds fields required for storing it
export function prepareResponseForStorage(response: FrontendResponseModelT): StoredResponseModelT {
  const meta = {
    response_id: uuidV4(),
    participant_id: createHash('sha256') // to preserve privacy, hash the participant_id before storing it, so after opening up the dataset, malicious actors can't submit more responses that pretend to belong to a previous participant
      .update(response.participant_id + pepper) // include a global but secret pepper, so the resulting hashes are harder (or impossible) to reverse
      .digest('base64'), // e.g. "3085e05e-6f64-11ea-9f12-3b5bbd3456ee" => "K/FwCDUHL3iVb9JAMBdSEurw4rWuO/iJmcIWCn2B++s="
    timestamp: new Date() // for security, don't trust browser clock, as it may be wrong or fraudulent
      .toISOString()
      .replace(/:..\..*/, ':00.000Z'), // to preserve privacy, intentionally reduce precision of the timestamp
    postal_code: mapPostalCode(response).postal_code, // to protect the privacy of participants from very small postal code areas, they are merged into larger ones, based on known population data
  };
  return { ...meta, ...response, ...meta }; // the double "...meta" is just for vanity: we want the meta-fields to appear first in the JSON representation
}

// Produces the key under which this response should be stored in S3
function getStorageKey(response: StoredResponseModelT): string {
  const [date, time] = response.timestamp.split('T');
  return `responses/raw/${date}/${time}/${response.response_id}.json`;
}
