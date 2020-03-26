import * as AWS from 'aws-sdk';
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
    timestamp: new Date()
      .toISOString() // for security, don't trust browser clock, as it may be wrong or fraudulent
      .replace(/:..\..*/, ':00.000Z'), // to preserve privacy, intentionally reduce precision of the timestamp
  });
}

// Produces the key under which this response should be stored in S3
function getStorageKey(response: ResponseModelT): string {
  const [date, time] = response.timestamp.split('T');
  return `responses/raw/${date}/${time}/${response.participant_uuid}.json`;
}
