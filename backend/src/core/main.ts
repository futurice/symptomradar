import * as AWS from 'aws-sdk';
import { ResponseModelT } from '../common/model';

const s3: AWS.S3 = new AWS.S3({ apiVersion: '2006-03-01' });
const bucket = process.env.BUCKET_NAME_STORAGE || '';

if (!bucket) throw new Error('Storage bucket name missing from environment');

export function storeResponseInS3(response: ResponseModelT) {
  const timestamp = new Date().toISOString();
  const [date, time] = timestamp.split('T');
  const r = { ...response, timestamp }; // browser clock may be wrong/fraudulent, so overwrite with server time
  return s3
    .putObject({
      Bucket: bucket,
      Key: `responses/raw/${date}/${time}/${r.participant_uuid}.json`,
      Body: JSON.stringify(r),
      ACL: 'private',
    })
    .promise()
    .then(() => {});
}
