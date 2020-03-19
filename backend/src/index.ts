import { APIGatewayProxyHandler, Handler } from "aws-lambda";

export const apiEntrypoint: APIGatewayProxyHandler = () => {
  return Promise.resolve({
    statusCode: 200,
    body: JSON.stringify({ hello: "api" }, null, 2)
  });
};

export const workerEntrypoint: Handler<unknown> = () => {
  console.log({ hello: "worker" });
};
