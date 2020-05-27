import { fromPairs, groupBy, mapValues, map } from 'lodash';
import { stringLiteralUnionFields, PostalCodeCityMappings, PopulationPerCity } from '../../common/model';
import { App, s3PutJsonHelper } from '../app';
import { mapResponseFieldsToQuery } from './queryUtils';
import { accumulateResultsByCity } from './cityLevelGeneralResults';

export async function exportCityLevelDailyTotals(app: App) {
  const cityLevelDailyTotals = await fetchCityLevelDailyTotals(app);
  await pushCityLevelDailyTotals(app, cityLevelDailyTotals);
}

export async function fetchCityLevelDailyTotals(app: App) {
  const postalCodeLevelDailyTotalsResult = await queryPostalCodeLevelDailyTotals(app);

  const postalCodeCityMappings = await app.s3Sources.fetchPostalCodeCityMappings();
  const populationPerCity = await app.s3Sources.fetchPopulationPerCity();

  const cityLevelDailyTotals = mapCityLevelDailyTotals(
    postalCodeLevelDailyTotalsResult.Items,
    postalCodeCityMappings,
    populationPerCity,
  );
  return cityLevelDailyTotals;
}

interface PostalCodeLevelDailyTotalsQuery extends Record<string, string> {
  day: string;
  postal_code: string;
  responses: string;
}

export const postalCodeLevelDailyTotalsQuery = `
SELECT
  SUBSTR(timestamp, 1, 10) AS day,
  postal_code,
  COUNT(*) AS responses,
  ${mapResponseFieldsToQuery((field, value) => `  COUNT(IF(${field} = '${value}', 1, NULL)) AS ${field}_${value}`)}
FROM responses WHERE (country_code = 'FI' or country_code = '')
GROUP BY SUBSTR(timestamp, 1, 10), postal_code
ORDER BY day
`;

async function queryPostalCodeLevelDailyTotals(app: App) {
  return app.athenaClient.query<PostalCodeLevelDailyTotalsQuery>({
    sql: postalCodeLevelDailyTotalsQuery,
    db: app.constants.athenaDb,
  });
}

function mapCityLevelDailyTotals(
  postalCodeLevelDailyTotalsResult: PostalCodeLevelDailyTotalsQuery[],
  postalCodeCityMappings: PostalCodeCityMappings,
  populationPerCity: PopulationPerCity,
) {
  const resultsByDate = groupBy(postalCodeLevelDailyTotalsResult, item => item.day);

  const a = mapValues(resultsByDate, items =>
    accumulateResultsByCity(items as any, postalCodeCityMappings, populationPerCity),
  );

  const cityLevelDailyTotals = map(a, (items, day) => ({
    day,
    cities: map(items, item => ({
      city: item.city,
      total: Number(item.responses),
      population: item.population,
      ...collateDailyTotalItem(item as any),
    })),
  }));

  return cityLevelDailyTotals;
}

type CityLevelDailyTotals = ReturnType<typeof mapCityLevelDailyTotals>;

// @example collateDailyTotalItem({
//   day: '2020-03-26',
//   total: '5823',
//   fever_no: '5126',
//   fever_slight: '623',
//   fever_high: '74',
//   ...
// }) => {
//   fever: { no: 5126, slight: 623, high: 74 },
//   ...
// }
function collateDailyTotalItem(item: PostalCodeLevelDailyTotalsQuery) {
  return fromPairs(
    stringLiteralUnionFields
      .filter(([field]) => field !== 'gender')
      .map(([field, values]) => [field, fromPairs(values.map(value => [value, Number(item[`${field}_${value}`])]))]),
  ) as any;
}

export async function pushCityLevelDailyTotals(app: App, cityLevelDailyTotals: CityLevelDailyTotals) {
  return s3PutJsonHelper(app.s3Client, {
    Bucket: app.constants.openDataBucket,
    Key: app.constants.cityLevelDailyTotalsKey,
    Body: {
      meta: {
        description:
          'Population and daily response count per each city in Finland. Population data from Tilastokeskus. This data is released for journalistic and scientific purposes.',
        generated: new Date().toISOString(),
        link: `https://${app.constants.domainName}/${app.constants.cityLevelDailyTotalsKey}`,
      },
      data: cityLevelDailyTotals,
    },
  });
}
