import { APIGatewayProxyHandler, Handler } from 'aws-lambda';
import { KEY } from './common/const';
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
  console.log({ [KEY]: 'worker' });
};

if (process.argv[0].match(/\/ts-node$/)) {
  console.log(`${KEY}: CLI`);
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
    },
  };
};
