import { APIGatewayProxyHandler, Handler } from "aws-lambda";
import { KEY } from "./common/const";

export const apiEntrypoint: APIGatewayProxyHandler = () => {
  return Promise.resolve({
    statusCode: 200,
    body: JSON.stringify({ [KEY]: "api" }, null, 2)
  });
};

export const workerEntrypoint: Handler<unknown> = () => {
  console.log({ [KEY]: "worker" });
};
