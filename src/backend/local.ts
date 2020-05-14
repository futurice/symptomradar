import http from 'http';
import { parse as parseUrl } from 'url';
import { APIGatewayProxyHandler, APIGatewayProxyEventBase, Context, APIGatewayProxyResult } from 'aws-lambda';

import * as entrypoints from '../index-backend';
import { AddressInfo } from 'net';

const server = http.createServer((req: http.IncomingMessage, res: http.ServerResponse) => {
  const url = parseUrl(req.url!);
  const { pathname } = url;
  const name = pathname!.slice(1) as keyof typeof entrypoints;

  console.log(`${req.method} ${req.url}`);

  console.log(`Checking for entrypoint ${name} (${pathname})`);

  //
  // Rudimentary routing
  const entrypoint = entrypoints[name] as APIGatewayProxyHandler;

  if (!entrypoint) {
    res.writeHead(404);
    res.end();
    return;
  }

  //
  // Parse request and execute
  Promise.resolve()
    // Read body data
    .then(() => {
      return new Promise<string>((resolve, reject) => {
        const data: string[] = [];
        req.on('data', chunk => {
          data.push(chunk);
        });
        req.on('end', () => {
          resolve(data.join(''));
        });
      });
    })
    // Map request
    .then(
      body =>
        ({
          httpMethod: req.method,
          path: pathname,
          headers: { ...req.headers },
          body: body,
          requestContext: {
            identity: {
              sourceIp: '127.0.0.1',
            },
          },
        } as APIGatewayProxyEventBase<any>),
    )
    // Execute
    .then(event => entrypoint(event, {} as Context, x => x) as Promise<APIGatewayProxyResult>)
    .then(
      _res =>
        _res || {
          statusCode: 200,
          headers: {},
          body: '',
        },
    )
    .then(_res => {
      res.writeHead(_res.statusCode, _res.headers as any);
      res.write(_res.body);
      res.end();
    });
});

server.listen(3000, () => {
  const addr = server.address() as AddressInfo;
  console.log(`Local development server started at ${addr.address}:${addr.port} (${addr.family})`);
});
