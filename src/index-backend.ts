import { APIGatewayProxyHandler, Handler } from 'aws-lambda';
import { v4 as uuidV4 } from 'uuid';
import { assertIs, FrontendResponseModel, FrontendResponseModelT } from './common/model';
import { storeResponseInS3, prepareResponseForStorage, storeDataDumpsToS3, updateOpenDataIndex } from './backend/main';

export const apiEntrypoint: APIGatewayProxyHandler = (event, context) => {
  console.log(`Incoming request: ${event.httpMethod} ${event.path}`); // to preserve privacy, don't log any headers, etc
  if (event.httpMethod === 'OPTIONS') {
    return Promise.resolve().then(() => response(200, undefined));
  } else {
    const countryCode = event.headers['CloudFront-Viewer-Country'] || '';
    return Promise.resolve()
      .then(() => JSON.parse(event.body || '') as unknown)
      .then(assertIs(FrontendResponseModel))
      .then(res => storeResponseInS3(res, countryCode))
      .then(() => response(200, { success: true }))
      .catch(err => response(500, { error: true }, err));
  }
};

export const workerEntrypoint: Handler<unknown> = async () => {
  console.log('Worker started');
  try {
    await storeDataDumpsToS3();
    await updateOpenDataIndex();
    console.log('Worker done');
  } catch (error) {
    console.error('ERROR (WORKER)', error);
    throw error;
  }
};

if (process.argv[0].match(/\/ts-node$/)) {
  const test: FrontendResponseModelT = {
    participant_id: uuidV4(),
    fever: 'no',
    cough: 'mild',
    breathing_difficulties: 'no',
    muscle_pain: 'no',
    headache: 'no',
    sore_throat: 'no',
    rhinitis: 'no',
    stomach_issues: 'no',
    sensory_issues: 'no',
    healthcare_contact: 'no',
    general_wellbeing: 'fine',
    duration: '1', // or null
    longterm_medication: 'no',
    smoking: 'no',
    corona_suspicion: 'no',
    age_group: '20',
    gender: 'other',
    postal_code: '27160',
  };
  Promise.resolve(test)
    .then(assertIs(FrontendResponseModel))
    .then(res => prepareResponseForStorage(res, 'FI', Promise.resolve('fake-secret-pepper')))
    .catch(err => err)
    .then(res => console.log(res));
}

const response = (statusCode: number, body?: object, logError?: Error) => {
  console.log(`Outgoing response: ${statusCode}`);
  if (logError) console.error('ERROR (API)', logError);
  return {
    statusCode,
    body: body ? JSON.stringify(body, null, 2) : '',
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'no-store,must-revalidate',
      // Configure CORS to only allow submissions from our own UI:
      'Access-Control-Allow-Origin': process.env.CORS_ALLOW_ORIGIN || '',
      'Access-Control-Allow-Methods': 'POST,GET,PUT,PATCH,DELETE',
      'Access-Control-Allow-Headers':
        'Authorization,DNT,User-Agent,X-Requested-With,If-Modified-Since,Cache-Control,Content-Type,Range', // IMPORTANT: "*" is a valid value ONLY without "Access-Control-Allow-Credentials: true"
      'Access-Control-Expose-Headers': 'Content-Length,Content-Range',
      'Access-Control-Allow-Credentials': 'true',
      // Enforce HTTPS-only connections when possible:
      'Strict-Transport-Security': 'max-age=31557600; preload', // i.e. one year in seconds
    },
  };
};
