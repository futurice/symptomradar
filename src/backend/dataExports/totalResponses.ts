import { App, s3PutJsonHelper } from '../app';

export async function exportTotalResponses(app: App) {
  const totalResponses = await fetchTotalResponses(app);
  await pushTotalResponses(app, totalResponses);
}

export async function fetchTotalResponses(app: App) {
  const totalResponsesResult = await queryTotalResponses(app);
  const totalResponses = mapTotalResponses(totalResponsesResult.Items[0]);
  return totalResponses;
}

//
// Query

interface TotalResponsesQuery {
  total_responses: string;
}

const totalResponsesQuery = 'SELECT COUNT(*) as total_responses FROM responses';

export async function queryTotalResponses(app: App) {
  return app.athenaClient.query<TotalResponsesQuery>({ sql: totalResponsesQuery, db: app.constants.athenaDb });
}

//
// Map

export function mapTotalResponses(totalResponses: TotalResponsesQuery) {
  return { total_responses: Number(totalResponses.total_responses) };
}
type TotalResponses = ReturnType<typeof mapTotalResponses>;

//
// Push

export async function pushTotalResponses(app: App, totalResponses: TotalResponses) {
  return s3PutJsonHelper(app.s3Client, {
    Bucket: app.constants.openDataBucket,
    Key: app.constants.totalResponsesKey,
    Body: {
      meta: {
        description:
          'Total number of responses collected by the system thus far. This is the raw number before any filtering or abuse detection has been performed.',
        generated: new Date().toISOString(),
        link: `https://${app.constants.domainName}/total_responses.json`,
      },
      data: totalResponses,
    },
  });
}
