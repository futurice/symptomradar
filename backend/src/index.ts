import { APIGatewayProxyHandler, Handler } from 'aws-lambda';
import { v4 as uuidV4 } from 'uuid';
import { assertIs, ResponseModel } from './common/model';
import { storeResponseInS3 } from './core/main';

export const apiEntrypoint: APIGatewayProxyHandler = (event, context) => {
  console.log(`Incoming request: ${event.httpMethod} ${event.path}`, {
    headers: event.headers,
    queryString: event.queryStringParameters,
    body: event.body,
  });
  return Promise.resolve()
    .then(() => JSON.parse(event.body || '') as unknown)
    .then(assertIs(ResponseModel))
    .then(storeResponseInS3)
    .then(() => response(200, { success: true }))
    .catch(err => response(500, { error: true }, err));
};

export const workerEntrypoint: Handler<unknown> = () => {
  console.log('Worker started');
};

if (process.argv[0].match(/\/ts-node$/)) {
  Promise.resolve()
    .then(() => ({
      participant_uuid: uuidV4(),
      timestamp: new Date().toISOString(),
      fever: 'no',
      cough: 'mild',
      breathing_difficulties: 'no',
      muscle_pain: 'no',
      sore_throat: 'no',
      rhinitis: 'no',
      general_wellbeing: 'fine',
      duration: '1',
      longterm_medication: 'no',
      smoking: 'no',
      corona_suspicion: 'no',
      age: '18',
      gender: 'other',
      postal_code: '01234',
    }))
    .then(assertIs(ResponseModel))
    .catch(err => err)
    .then(res => console.log(res));
}

const response = (statusCode: number, body: object, logError?: Error) => {
  console.log(`Outgoing response: ${statusCode}`, { body });
  if (logError) console.error('ERROR', logError);
  return {
    statusCode,
    body: JSON.stringify(body, null, 2),
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'no-store,must-revalidate',
      // Configure CORS to only allow submissions from our own UI:
      'Access-Control-Allow-Origin': 'https://' + process.env.FRONTEND_DOMAIN,
      'Access-Control-Allow-Methods': 'POST,OPTIONS,GET,PUT,PATCH,DELETE',
      'Access-Control-Allow-Headers':
        'DNT,User-Agent,X-Requested-With,If-Modified-Since,Cache-Control,Content-Type,Range',
      'Access-Control-Expose-Headers': 'Content-Length,Content-Range',
    },
  };
};
