import { App, s3PutJsonHelper } from '../app';
import {
  accumulateResultsByCity,
  PostalCodeLevelGeneralResultsQuery,
  filterResultsByCity,
} from './cityLevelGeneralResults';
import { PostalCodeCityMappings, PopulationPerCity } from '../../common/model';

export async function exportCityLevelWeeklyGeneralResults(app: App) {
  const cityLevelWeeklyGeneralResults = await fetchCityLevelWeeklyGeneralResults(app);
  await pushCityLevelWeeklyGeneralResults(app, cityLevelWeeklyGeneralResults);
}

export async function fetchCityLevelWeeklyGeneralResults(app: App) {
  const postalCodeLevelResultsResult = await queryPostalCodeLevelGeneralResults(app);
  const postalCodeCityMappings = (await app.s3Sources.fetchPostalCodeCityMappings()) as PostalCodeCityMappings;
  const populationPerCity = (await app.s3Sources.fetchPopulationPerCity()) as PopulationPerCity;
  const cityLevelWeeklyGeneralResults = mapCityLevelWeeklyGeneralResults(
    postalCodeLevelResultsResult.Items,
    postalCodeCityMappings,
    populationPerCity,
  );
  return cityLevelWeeklyGeneralResults;
}

//
// Query

export const postalCodeLevelWeeklyGeneralResultsQuery = `SELECT postal_code,
  COUNT(*) AS responses,
  COUNT(IF ( fever = 'no', 1, NULL)) AS fever_no,
  COUNT(IF ( fever = 'slight', 1, NULL)) AS fever_slight,
  COUNT(IF ( fever = 'high', 1, NULL)) AS fever_high,
  COUNT(IF ( cough = 'no', 1, NULL)) AS cough_no,
  COUNT(IF ( cough = 'mild', 1, NULL)) AS cough_mild,
  COUNT(IF ( cough = 'intense', 1, NULL)) AS cough_intense,
  COUNT(IF ( general_wellbeing = 'fine', 1, NULL)) AS general_wellbeing_fine,
  COUNT(IF ( general_wellbeing = 'impaired', 1, NULL)) AS general_wellbeing_impaired,
  COUNT(IF ( general_wellbeing = 'bad', 1, NULL)) AS general_wellbeing_bad,
  COUNT(IF ( breathing_difficulties = 'no', 1, NULL)) AS breathing_difficulties_no,
  COUNT(IF ( breathing_difficulties = 'yes', 1, NULL)) AS breathing_difficulties_yes,
  COUNT(IF ( muscle_pain = 'no', 1, NULL)) AS muscle_pain_no,
  COUNT(IF ( muscle_pain = 'yes', 1, NULL)) AS muscle_pain_yes,
  COUNT(IF ( headache = 'no', 1, NULL)) AS headache_no,
  COUNT(IF ( headache = 'yes', 1, NULL)) AS headache_yes,
  COUNT(IF ( sore_throat = 'no', 1, NULL)) AS sore_throat_no,
  COUNT(IF ( sore_throat = 'yes', 1, NULL)) AS sore_throat_yes,
  COUNT(IF ( rhinitis = 'no', 1, NULL)) AS rhinitis_no,
  COUNT(IF ( rhinitis = 'yes', 1, NULL)) AS rhinitis_yes,
  COUNT(IF ( stomach_issues = 'no', 1, NULL)) AS stomach_issues_no,
  COUNT(IF ( stomach_issues = 'yes', 1, NULL)) AS stomach_issues_yes,
  COUNT(IF ( sensory_issues = 'no', 1, NULL)) AS sensory_issues_no,
  COUNT(IF ( sensory_issues = 'yes', 1, NULL)) AS sensory_issues_yes,
  COUNT(IF ( longterm_medication	 = 'no', 1, NULL)) AS longterm_medication_no,
  COUNT(IF ( longterm_medication	 = 'yes', 1, NULL)) AS longterm_medication_yes,
  COUNT(IF ( smoking	 = 'no', 1, NULL)) AS smoking_no,
  COUNT(IF ( smoking	 = 'yes', 1, NULL)) AS smoking_yes,
  COUNT(IF ( corona_suspicion	 = 'no', 1, NULL)) AS corona_suspicion_no,
  COUNT(IF ( corona_suspicion	 = 'yes', 1, NULL)) AS corona_suspicion_yes
FROM responses
WHERE (country_code = 'FI' or country_code = '')
  AND from_iso8601_timestamp(timestamp) >= date_add('day', -6, current_date)
GROUP BY  postal_code
ORDER BY  responses DESC`;

export async function queryPostalCodeLevelGeneralResults(app: App) {
  return app.athenaClient.query<PostalCodeLevelGeneralResultsQuery>({
    sql: postalCodeLevelWeeklyGeneralResultsQuery,
    db: app.constants.athenaDb,
  });
}

//
// Map

export function mapCityLevelWeeklyGeneralResults(
  postalCodeLevelGeneralResults: PostalCodeLevelGeneralResultsQuery[],
  postalCodeCityMappings: PostalCodeCityMappings,
  populationPerCity: PopulationPerCity,
) {
  const resultsByCity = accumulateResultsByCity(
    postalCodeLevelGeneralResults,
    postalCodeCityMappings,
    populationPerCity,
  );

  // Mark all entries with no responses with `-1` to conform to UI logic
  const filteredResultsByCity = filterResultsByCity(resultsByCity, cityData => cityData.responses > 0);

  // NOTE: v8 should maintain insertion order here, and since the original
  // data this is derived from arranges cities in alphabetical order,
  // this should be alphabetically ordered as well.

  return Object.values(filteredResultsByCity);
}

type CityLevelWeeklyGeneralResults = ReturnType<typeof mapCityLevelWeeklyGeneralResults>;

//
// Push

async function pushCityLevelWeeklyGeneralResults(
  app: App,
  cityLevelWeeklyGeneralResults: CityLevelWeeklyGeneralResults,
) {
  return s3PutJsonHelper(app.s3Client, {
    Bucket: app.constants.openDataBucket,
    Key: app.constants.cityLevelWeeklyGeneralResultsKey,
    Body: {
      meta: {
        description:
          'Weekly population and response count per each city in Finland, where the response count was higher than 25. All the form inputs are coded in city level. Population data from Tilastokeskus. This data is released for journalistic and scientific purposes.',
        generated: new Date().toISOString(),
        link: `https://${app.constants.domainName}/${app.constants.cityLevelWeeklyGeneralResultsKey}`,
      },
      data: cityLevelWeeklyGeneralResults,
    },
  });
}
