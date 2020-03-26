import * as AWS from 'aws-sdk';
import { ResponseModelT } from '../common/model';

const s3: AWS.S3 = new AWS.S3({ apiVersion: '2006-03-01' });
const bucket = process.env.BUCKET_NAME_STORAGE || '';

if (!bucket) throw new Error('Storage bucket name missing from environment');

// Saves the given response into our storage bucket
export function storeResponseInS3(response: ResponseModelT) {
  const timestamp = new Date().toISOString();
  const r = { ...response, timestamp }; // browser clock may be wrong/fraudulent, so overwrite with server time
  return s3
    .putObject({
      Bucket: bucket,
      Key: getStorageKey(r),
      Body: JSON.stringify(r),
      ACL: 'private',
    })
    .promise()
    .then(() => {});
}

// Produces the key under which this response should be stored in S3
function getStorageKey(response: ResponseModelT): string {
  const [date, time] = response.timestamp.split('T');
  return `responses/raw/${date}/${time}/${response.participant_uuid}.json`;
}
