import { App, s3PutJsonHelper } from '../app';
import {
  // OpenDataModel,
  // PostalCodeCityMappings,
  // PopulationPerCity,
  PostalCodeAreas,
  LowPopulationPostalCodes,
} from '../../common/model';

interface Response {
  [key: string]: any;
}

export async function exportResponses(app: App) {
  const responses = await fetchResponses(app);

  await pushResponses(app, responses);
}

export async function fetchResponses(app: App) {
  const responsesResult = await queryResponses(app);

  const postalCodeAreas = await app.s3Sources.fetchPostalCodeAreas();
  const lowPopulationPostalCodes = await app.s3Sources.fetchLowPopulationPostalCodes();

  const responses = mapResponses(responsesResult.Items, postalCodeAreas, lowPopulationPostalCodes);

  return responses;
}

interface ResponsesQuery {
  [key: string]: any;
}

export const responsesQuery = `
  SELECT *
  FROM
    responses
  WHERE
    country_code = 'FI'
    OR
    country_code = ''
  ORDER BY timestamp ASC
`;

export async function queryResponses(app: App) {
  return app.athenaClient.query<ResponsesQuery>({
    sql: responsesQuery,
    db: app.constants.athenaDb,
  });
}

export function mapResponses(
  responses: ResponsesQuery[],
  postalCodeAreas: PostalCodeAreas,
  lowPopulationPostalCodes: LowPopulationPostalCodes,
) {
  // TODO: Map and filter the responses
  const outputs = [];

  for (const response of responses) {
    outputs.push(response);
  }

  return outputs;
}

export async function pushResponses(app: App, responses: Response[]) {
  await s3PutJsonHelper(app.s3Client, {
    Bucket: app.constants.openDataBucket,
    // TODO:
    Key: app.constants.responsesFullKey,
    Body: {
      meta: {
        description: 'TODO',
        generated: new Date().toISOString(),
        link: `https://${app.constants.domainName}/${app.constants.responsesFullKey}`,
      },
      data: responses,
    },
  });
}
