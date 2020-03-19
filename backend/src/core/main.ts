import * as AWS from 'aws-sdk';
import { ResponseModelT } from '../common/model';

const s3: AWS.S3 = new AWS.S3({ apiVersion: '2006-03-01' });
const bucket: string = 'vigilant-sniffle-dev-storage';

export function storeResponseInS3(response: ResponseModelT) {
  const timestamp = new Date().toISOString();
  const [date, time] = timestamp.split('T');
  const r = { ...response, timestamp }; // browser clock may be wrong/fraudulent, so overwrite with server time
  return s3
    .putObject({
      Bucket: bucket,
      Key: `responses/raw/${date}/${time}/${r.participantUuid}.json`,
      Body: JSON.stringify(r),
      ACL: 'private',
    })
    .promise()
    .then(() => {});
}
