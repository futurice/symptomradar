import * as AWS from 'aws-sdk';
import { createHash } from 'crypto';
import { assertIs, ResponseModel, ResponseModelT } from '../common/model';

const s3: AWS.S3 = new AWS.S3({ apiVersion: '2006-03-01' });
const bucket = process.env.BUCKET_NAME_STORAGE || '';

// Crash and burn immediately (instead of at first request) for invalid configuration
if (!bucket) throw new Error('Storage bucket name missing from environment');

// Saves the given response into our storage bucket
export function storeResponseInS3(response: ResponseModelT) {
  response = scrubResponseForStorage(response);
  return s3
    .putObject({
      Bucket: bucket,
      Key: getStorageKey(response),
      Body: JSON.stringify(response),
      ACL: 'private',
    })
    .promise()
    .then(() => {}); // don't promise any value, just the success of the operation
}

// Makes the response safe for storage
function scrubResponseForStorage(response: ResponseModelT): ResponseModelT {
  return assertIs(ResponseModel)({
    ...response,
    participant_uuid: createHash('sha256') // to preserve privacy, hash the participant_uuid before storing it, so after opening up the dataset, malicious actors can't submit more responses that pretend to belong to a previous participant
      .update(response.participant_uuid)
      .digest('base64'), // e.g. "3085e05e-6f64-11ea-9f12-3b5bbd3456ee" => "K/FwCDUHL3iVb9JAMBdSEurw4rWuO/iJmcIWCn2B++s="
    timestamp: new Date() // for security, don't trust browser clock, as it may be wrong or fraudulent
      .toISOString()
      .replace(/:..\..*/, ':00.000Z'), // to preserve privacy, intentionally reduce precision of the timestamp
  });
}

// Produces the key under which this response should be stored in S3
function getStorageKey(response: ResponseModelT): string {
  const [date, time] = response.timestamp.split('T');
  return `responses/raw/${date}/${time}/${response.participant_uuid}.json`;
}
