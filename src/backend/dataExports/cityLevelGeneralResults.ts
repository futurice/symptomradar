import { App, s3PutJsonHelper } from '../app';
import { PostalCodeCityMappings, PopulationPerCity } from '../../common/model';
import {
  queryPostalCodeLevelGeneralResults,
  PostalCodeLevelGeneralResultsQuery,
} from './postalCodeLevelGeneralResults';

export async function exportCityLevelGeneralResults(app: App) {
  const cityLevelGeneralResults = await fetchCityLevelGeneralResults(app);
  await pushCityLevelGeneralResults(app, cityLevelGeneralResults);
}

export async function fetchCityLevelGeneralResults(app: App) {
  const postalCodeLevelResultsResult = await queryPostalCodeLevelGeneralResults(app);

  const postalCodeCityMappings = await app.s3Sources.fetchPostalCodeCityMappings();
  const populationPerCity = await app.s3Sources.fetchPopulationPerCity();

  const cityLevelGeneralResults = mapCityLevelGeneralResults(
    postalCodeLevelResultsResult.Items,
    postalCodeCityMappings,
    populationPerCity,
  );
  return cityLevelGeneralResults;
}

//
// Map

export interface CityLevelGeneralResult {
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
  const resultsByCity = accumulateResultsByCity(
    postalCodeLevelGeneralResults,
    postalCodeCityMappings,
    populationPerCity,
  );

  const filteredResultsByCity = filterResultsByCity(resultsByCity, cityData => cityData.responses >= 25);

  // NOTE: v8 should maintain insertion order here, and since the original
  // data this is derived from arranges cities in alphabetical order,
  // this should be alphabetically ordered as well.

  return Object.values(filteredResultsByCity);
}

type CityLevelGeneralResults = ReturnType<typeof mapCityLevelGeneralResults>;

export function accumulateResultsByCity(
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
      console.warn(`WARNING: accumulateResultsByCity: Skipping unknown postal code ${postalCodeData.postal_code}`);
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

  return resultsByCity;
}

export type ResultsByCity = ReturnType<typeof accumulateResultsByCity>;

// NOTE: Filtering happens by setting all values to -1
export function filterResultsByCity(resultsByCity: ResultsByCity, fn: (cityData: CityLevelGeneralResult) => boolean) {
  const filteredResultsByCity: ResultsByCity = {};

  for (const [key, cityData] of Object.entries(resultsByCity)) {
    if (fn(cityData)) {
      filteredResultsByCity[key] = { ...cityData };
    } else {
      filteredResultsByCity[key] = {
        ...cityData,
        responses: -1,
        fever_no: -1,
        fever_slight: -1,
        fever_high: -1,
        cough_no: -1,
        cough_mild: -1,
        cough_intense: -1,
        general_wellbeing_fine: -1,
        general_wellbeing_impaired: -1,
        general_wellbeing_bad: -1,
        breathing_difficulties_no: -1,
        breathing_difficulties_yes: -1,
        muscle_pain_no: -1,
        muscle_pain_yes: -1,
        headache_no: -1,
        headache_yes: -1,
        sore_throat_no: -1,
        sore_throat_yes: -1,
        rhinitis_no: -1,
        rhinitis_yes: -1,
        stomach_issues_no: -1,
        stomach_issues_yes: -1,
        sensory_issues_no: -1,
        sensory_issues_yes: -1,
        longterm_medication_no: -1,
        longterm_medication_yes: -1,
        smoking_no: -1,
        smoking_yes: -1,
        corona_suspicion_no: -1,
        corona_suspicion_yes: -1,
      };
    }
  }

  return filteredResultsByCity;
}

//
// Push

export async function pushCityLevelGeneralResults(app: App, cityLevelGeneralResults: CityLevelGeneralResults) {
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
