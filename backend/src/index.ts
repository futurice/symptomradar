import { APIGatewayProxyHandler, Handler } from 'aws-lambda';
import { v4 as uuidV4 } from 'uuid';
import { assertIs, FrontendResponseModel, FrontendResponseModelT } from './common/model';
import { prepareResponseForStorage, storeResponseInS3 } from './core/main';

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

export const workerEntrypoint: Handler<unknown> = () => {
  console.log('Worker started');
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
    .then(res => prepareResponseForStorage(res, 'FI'))
    .catch(err => err)
    .then(res => console.log(res));
}

const response = (statusCode: number, body?: object, logError?: Error) => {
  console.log(`Outgoing response: ${statusCode}`);
  if (logError) console.error('ERROR', logError);
  return {
    statusCode,
    body: body ? JSON.stringify(body, null, 2) : '',
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'no-store,must-revalidate',
      // Configure CORS to only allow submissions from our own UI:
      'Access-Control-Allow-Origin': process.env.CORS_ALLOW_ORIGIN || '',
      'Access-Control-Allow-Methods': 'POST,OPTIONS,GET,PUT,PATCH,DELETE',
      'Access-Control-Allow-Headers':
        'DNT,User-Agent,X-Requested-With,If-Modified-Since,Cache-Control,Content-Type,Range',
      'Access-Control-Expose-Headers': 'Content-Length,Content-Range',
      // Enforce HTTPS-only connections when possible:
      'Strict-Transport-Security': 'max-age=31557600; preload', // i.e. one year in seconds
    },
  };
};
