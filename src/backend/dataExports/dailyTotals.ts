import { flatten, fromPairs } from 'lodash';
import { App, s3PutJsonHelper } from '../app';
import { stringLiteralUnionFields } from '../../common/model';

export async function exportDailyTotals(app: App) {
  const dailyTotals = await fetchDailyTotals(app);
  await pushDailyTotals(app, dailyTotals);
}

export async function fetchDailyTotals(app: App) {
  const dailyTotalsResult = await queryDailyTotals(app);
  const dailyTotals = mapDailyTotals(dailyTotalsResult.Items);
  return dailyTotals;
}

interface DailyTotalsQuery extends Record<string, string> {
  day: string;
  total: string;
}

export const dailyTotalsQuery = `
SELECT
  day,
  COUNT(*) AS total,
  ${flatten(
    stringLiteralUnionFields.map(([field, values]) =>
      values.map(value => `SUM(${field}_${value}) AS ${field}_${value}`),
    ),
  ).join(',\n')}
FROM
  (
    SELECT
      SUBSTR(timestamp, 1, 10) AS day,
      ${flatten(
        stringLiteralUnionFields.map(([field, values]) =>
          values.map(value => `IF(${field} = '${value}', 1, 0) AS ${field}_${value}`),
        ),
      ).join(',\n')}
    FROM
      responses
    WHERE
      country_code = 'FI'
      OR
      country_code = ''
  )
GROUP BY day
ORDER BY day
`;

export async function queryDailyTotals(app: App) {
  return app.athenaClient.query<DailyTotalsQuery>({ sql: dailyTotalsQuery, db: app.constants.athenaDb });
}

export function mapDailyTotals(dailyTotalsResponse: DailyTotalsQuery[]) {
  const dailyTotalsData = dailyTotalsResponse.map(item => ({
    day: item.day,
    total: item.total,
    ...collateDailyTotalItem(item),
  }));

  return dailyTotalsData;
}

type DailyTotals = ReturnType<typeof mapDailyTotals>;

// @example collateDailyTotalItem({
//   day: '2020-03-26',
//   total: '5823',
//   fever_no: '5126',
//   fever_slight: '623',
//   fever_high: '74',
//   ...
// }) => {
//   day: '2020-03-26',
//   total: 5823,
//   fever: { no: 5126, slight: 623, high: 74 },
//   ...
// }
function collateDailyTotalItem(item: any) {
  return {
    day: item.day,
    total: Number(item.total),
    ...fromPairs(
      stringLiteralUnionFields.map(([field, values]) => [
        field,
        fromPairs(values.map(value => [value, Number(item[`${field}_${value}`])])),
      ]),
    ),
  };
}

async function pushDailyTotals(app: App, dailyTotals: DailyTotals) {
  return s3PutJsonHelper(app.s3Client, {
    Bucket: app.constants.openDataBucket,
    Key: app.constants.dailyTotalsKey,
    Body: {
      meta: {
        description: 'Total responses and field-specific totals per each day.',
        generated: new Date().toISOString(),
        link: `https://${app.constants.domainName}/${app.constants.dailyTotalsKey}`,
      },
      data: dailyTotals,
    },
  });
}
