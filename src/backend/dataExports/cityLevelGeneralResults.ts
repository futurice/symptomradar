import { App, s3PutJsonHelper } from '../app';

export async function exportCityLevelGeneralResults(app: App) {
  const postalCodeLevelResultsResult = await queryPostalCodeLevelGeneralResults(app);
  const postalCodeCityMappings = (await app.s3Sources.fetchPostalCodeCityMappings()) as PostalCodeCityMappings;
  const populationPerCity = (await app.s3Sources.fetchPopulationPerCity()) as PopulationPerCity;
  const cityLevelGeneralResults = mapCityLevelGeneralResults(
    postalCodeLevelResultsResult.Items,
    postalCodeCityMappings,
    populationPerCity,
  );
  await pushCityLevelGeneralResults(app, cityLevelGeneralResults);
}

//
// Query

// TODO: Move these queries to postalLevelGeneralResults.ts

interface PostalCodeLevelGeneralResultsQuery {
  postal_code: string;
  responses: string;
  fever_no: string;
  fever_slight: string;
  fever_high: string;
  cough_no: string;
  cough_mild: string;
  cough_intense: string;
  general_wellbeing_fine: string;
  general_wellbeing_impaired: string;
  general_wellbeing_bad: string;
  breathing_difficulties_no: string;
  breathing_difficulties_yes: string;
  muscle_pain_no: string;
  muscle_pain_yes: string;
  headache_no: string;
  headache_yes: string;
  sore_throat_no: string;
  sore_throat_yes: string;
  rhinitis_no: string;
  rhinitis_yes: string;
  stomach_issues_no: string;
  stomach_issues_yes: string;
  sensory_issues_no: string;
  sensory_issues_yes: string;
  longterm_medication_no: string;
  longterm_medication_yes: string;
  smoking_no: string;
  smoking_yes: string;
  corona_suspicion_no: string;
  corona_suspicion_yes: string;
}

export const postalCodeLevelGeneralResultsQuery = `SELECT postal_code,
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
FROM responses WHERE (country_code = 'FI' or country_code = '')
GROUP BY  postal_code
ORDER BY  responses DESC`;

export async function queryPostalCodeLevelGeneralResults(app: App) {
  return app.athenaClient.query<PostalCodeLevelGeneralResultsQuery>({
    sql: postalCodeLevelGeneralResultsQuery,
    db: app.constants.athenaDb,
  });
}

//
// Map

interface OpenDataModel<T> {
  meta: {
    description: string;
    generated: string;
    link: string;
  };
  data: T;
}

type PostalCodeCityMappings = OpenDataModel<Record<string, string>>;
type PopulationPerCity = OpenDataModel<
  Array<{
    city: string;
    population: number;
  }>
>;

// NOTE: Reuse for postal code level data
interface CityLevelGeneralResult {
  city: string;
  population: number;
  responses: number;
  fever_no: number;
  fever_slight: number;
  fever_high: number;
  cough_no: number;
  cough_mild: number;
  cough_intense: number;
  general_wellbeing_fine: number;
  general_wellbeing_impaired: number;
  general_wellbeing_bad: number;
  breathing_difficulties_no: number;
  breathing_difficulties_yes: number;
  muscle_pain_no: number;
  muscle_pain_yes: number;
  headache_no: number;
  headache_yes: number;
  sore_throat_no: number;
  sore_throat_yes: number;
  rhinitis_no: number;
  rhinitis_yes: number;
  stomach_issues_no: number;
  stomach_issues_yes: number;
  sensory_issues_no: number;
  sensory_issues_yes: number;
  longterm_medication_no: number;
  longterm_medication_yes: number;
  smoking_no: number;
  smoking_yes: number;
  corona_suspicion_no: number;
  corona_suspicion_yes: number;
}

export function mapCityLevelGeneralResults(
  postalCodeLevelGeneralResults: PostalCodeLevelGeneralResultsQuery[],
  postalCodeCityMappings: PostalCodeCityMappings,
  populationPerCity: PopulationPerCity,
) {
  // Generate initial city-level aggregation set from the city population data
  const resultsByCity = populationPerCity.data.reduce((acc, data) => {
    acc[data.city] = {
      city: data.city,
      population: data.population,
      responses: 0,
      fever_no: 0,
      fever_slight: 0,
      fever_high: 0,
      cough_no: 0,
      cough_mild: 0,
      cough_intense: 0,
      general_wellbeing_fine: 0,
      general_wellbeing_impaired: 0,
      general_wellbeing_bad: 0,
      breathing_difficulties_no: 0,
      breathing_difficulties_yes: 0,
      muscle_pain_no: 0,
      muscle_pain_yes: 0,
      headache_no: 0,
      headache_yes: 0,
      sore_throat_no: 0,
      sore_throat_yes: 0,
      rhinitis_no: 0,
      rhinitis_yes: 0,
      stomach_issues_no: 0,
      stomach_issues_yes: 0,
      sensory_issues_no: 0,
      sensory_issues_yes: 0,
      longterm_medication_no: 0,
      longterm_medication_yes: 0,
      smoking_no: 0,
      smoking_yes: 0,
      corona_suspicion_no: 0,
      corona_suspicion_yes: 0,
    };
    return acc;
  }, {} as Record<string, CityLevelGeneralResult>);

  // Accumulate postal code level data into city level data
  for (const postalCodeData of postalCodeLevelGeneralResults) {
    const city = postalCodeCityMappings.data[postalCodeData.postal_code];

    if (!city || !(city in resultsByCity)) {
      console.warn(`WARNING: mapCityLevelGeneralResults: Skipping unknown postal code ${postalCodeData.postal_code}`);
      continue;
    }

    resultsByCity[city].responses += Number(postalCodeData.responses);
    resultsByCity[city].fever_no += Number(postalCodeData.fever_no);
    resultsByCity[city].fever_slight += Number(postalCodeData.fever_slight);
    resultsByCity[city].fever_high += Number(postalCodeData.fever_high);
    resultsByCity[city].cough_no += Number(postalCodeData.cough_no);
    resultsByCity[city].cough_mild += Number(postalCodeData.cough_mild);
    resultsByCity[city].cough_intense += Number(postalCodeData.cough_intense);
    resultsByCity[city].general_wellbeing_fine += Number(postalCodeData.general_wellbeing_fine);
    resultsByCity[city].general_wellbeing_impaired += Number(postalCodeData.general_wellbeing_impaired);
    resultsByCity[city].general_wellbeing_bad += Number(postalCodeData.general_wellbeing_bad);
    resultsByCity[city].breathing_difficulties_no += Number(postalCodeData.breathing_difficulties_no);
    resultsByCity[city].breathing_difficulties_yes += Number(postalCodeData.breathing_difficulties_yes);
    resultsByCity[city].muscle_pain_no += Number(postalCodeData.muscle_pain_no);
    resultsByCity[city].muscle_pain_yes += Number(postalCodeData.muscle_pain_yes);
    resultsByCity[city].headache_no += Number(postalCodeData.headache_no);
    resultsByCity[city].headache_yes += Number(postalCodeData.headache_yes);
    resultsByCity[city].sore_throat_no += Number(postalCodeData.sore_throat_no);
    resultsByCity[city].sore_throat_yes += Number(postalCodeData.sore_throat_yes);
    resultsByCity[city].rhinitis_no += Number(postalCodeData.rhinitis_no);
    resultsByCity[city].rhinitis_yes += Number(postalCodeData.rhinitis_yes);
    resultsByCity[city].stomach_issues_no += Number(postalCodeData.stomach_issues_no);
    resultsByCity[city].stomach_issues_yes += Number(postalCodeData.stomach_issues_yes);
    resultsByCity[city].sensory_issues_no += Number(postalCodeData.sensory_issues_no);
    resultsByCity[city].sensory_issues_yes += Number(postalCodeData.sensory_issues_yes);
    resultsByCity[city].longterm_medication_no += Number(postalCodeData.longterm_medication_no);
    resultsByCity[city].longterm_medication_yes += Number(postalCodeData.longterm_medication_yes);
    resultsByCity[city].smoking_no += Number(postalCodeData.smoking_no);
    resultsByCity[city].smoking_yes += Number(postalCodeData.smoking_yes);
    resultsByCity[city].corona_suspicion_no += Number(postalCodeData.corona_suspicion_no);
    resultsByCity[city].corona_suspicion_yes += Number(postalCodeData.corona_suspicion_yes);
  }

  // NOTE: v8 should maintain insertion order here, and since the original
  // data this is derived from arranges cities in alphabetical order,
  // this should be alphabetically ordered as well.

  return Object.values(resultsByCity);
}

type CityLevelGeneralResults = ReturnType<typeof mapCityLevelGeneralResults>;

//
// Push

async function pushCityLevelGeneralResults(app: App, cityLevelGeneralResults: CityLevelGeneralResults) {
  return s3PutJsonHelper(app.s3Client, {
    Bucket: app.constants.openDataBucket,
    Key: app.constants.cityLevelGeneralResultsKey,
    Body: {
      meta: {
        description:
          'Population and response count per each city in Finland, where the response count was higher than 25. All the form inputs are coded in city level. Population data from Tilastokeskus. This data is released for journalistic and scientific purposes.',
        generated: new Date().toISOString(),
        link: `https://${app.constants.domainName}/${app.constants.cityLevelGeneralResultsKey}`,
      },
      data: cityLevelGeneralResults,
    },
  });
}
