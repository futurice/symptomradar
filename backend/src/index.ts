import { APIGatewayProxyHandler, Handler } from 'aws-lambda';
import { KEY } from './common/const';
import { storeResponseInS3 } from './core/main';
import { v4 as uuidV4 } from 'uuid';

export const apiEntrypoint: APIGatewayProxyHandler = () => {
  return Promise.resolve({
    statusCode: 200,
    body: JSON.stringify({ [KEY]: 'api' }, null, 2),
  });
};

export const workerEntrypoint: Handler<unknown> = () => {
  console.log({ [KEY]: 'worker' });
};

if (process.argv[0].match(/\/ts-node$/)) {
  console.log(`${KEY}: CLI`);
  const colors = ['red', 'green', 'blue', 'yellow', 'orange', 'cyan', 'purple'];
  const color = colors[Math.floor(Math.random() * colors.length)];
  storeResponseInS3(uuidV4(), 'Bob', color).then(
    res => console.log('SUCCESS', res),
    err => console.log('ERROR', err),
  );
}
