import { App, s3PutJsonHelper } from '../app';
import { LowPopulationPostalCodes, PostalCodeAreas } from '../../common/model';

export async function exportPostalCodeLevelGeneralResults(app: App) {
  const postalCodeLevelResults = await fetchPostalCodeLevelGeneralResults(app);
  await pushPostalCodeLevelGeneralResults(app, postalCodeLevelResults);
}

export async function fetchPostalCodeLevelGeneralResults(app: App) {
  const postalCodeLevelResultsResult = await queryPostalCodeLevelGeneralResults(app);

  const postalCodeAreas = await app.s3Sources.fetchPostalCodeAreas();
  const lowPopulationPostalCodes = await app.s3Sources.fetchLowPopulationPostalCodes();

  const postalCodeLevelResults = await mapPostalCodeLevelGeneralResults(
    postalCodeLevelResultsResult.Items,
    postalCodeAreas,
    lowPopulationPostalCodes,
  );

  return postalCodeLevelResults;
}

//
// Query

export interface PostalCodeLevelGeneralResultsQuery {
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
// Format data

export interface PostalCodeLevelGeneralResult {
  code: string;
  name: string;
  city: string;
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

export function mapPostalCodeLevelGeneralResults(
  postalCodeLevelGeneralResults: PostalCodeLevelGeneralResultsQuery[],
  postalCodeAreas: PostalCodeAreas,
  lowPopulationPostalCodes: LowPopulationPostalCodes,
) {
  // Init data based on postalCodeAreas, filter by lowPopulationPostalCodes
  const resultsByPostalCode = accumulateResultsByPostalCode(
    postalCodeLevelGeneralResults,
    postalCodeAreas,
    lowPopulationPostalCodes,
  );

  const filteredResultsByPostalCode = filterResultsByPostalCode(
    resultsByPostalCode,
    postalCodeData => postalCodeData.responses >= 10,
  );

  return Object.values(filteredResultsByPostalCode);
}

type PostalCodeLevelGeneralResults = ReturnType<typeof mapPostalCodeLevelGeneralResults>;

function accumulateResultsByPostalCode(
  postalCodeLevelGeneralResults: PostalCodeLevelGeneralResultsQuery[],
  postalCodeAreas: PostalCodeAreas,
  lowPopulationPostalCodes: LowPopulationPostalCodes,
) {
  // Initialize data
  // TODO: Include population
  const resultsByPostalCode = postalCodeAreas.data.reduce((memo, next) => {
    // Only include this postal code area if it doesn't exist
    // in low population postal areas
    if (!(next.code in lowPopulationPostalCodes.data)) {
      memo[next.code] = {
        code: next.code,
        name: next.name,
        city: next.city,
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
    }
    return memo;
  }, {} as Record<string, PostalCodeLevelGeneralResult>);

  // Accumulate data
  for (const postalCodeData of postalCodeLevelGeneralResults) {
    const postalCode = lowPopulationPostalCodes.data[postalCodeData.postal_code] || postalCodeData.postal_code;

    if (!postalCode || !(postalCode in resultsByPostalCode)) {
      console.warn(`WARNING: accumulateResultsByPostalCode: Skipping unknown postal code ${postalCode}`);
      continue;
    }

    resultsByPostalCode[postalCode].responses += Number(postalCodeData.responses);
    resultsByPostalCode[postalCode].fever_no += Number(postalCodeData.fever_no);
    resultsByPostalCode[postalCode].fever_slight += Number(postalCodeData.fever_slight);
    resultsByPostalCode[postalCode].fever_high += Number(postalCodeData.fever_high);
    resultsByPostalCode[postalCode].cough_no += Number(postalCodeData.cough_no);
    resultsByPostalCode[postalCode].cough_mild += Number(postalCodeData.cough_mild);
    resultsByPostalCode[postalCode].cough_intense += Number(postalCodeData.cough_intense);
    resultsByPostalCode[postalCode].general_wellbeing_fine += Number(postalCodeData.general_wellbeing_fine);
    resultsByPostalCode[postalCode].general_wellbeing_impaired += Number(postalCodeData.general_wellbeing_impaired);
    resultsByPostalCode[postalCode].general_wellbeing_bad += Number(postalCodeData.general_wellbeing_bad);
    resultsByPostalCode[postalCode].breathing_difficulties_no += Number(postalCodeData.breathing_difficulties_no);
    resultsByPostalCode[postalCode].breathing_difficulties_yes += Number(postalCodeData.breathing_difficulties_yes);
    resultsByPostalCode[postalCode].muscle_pain_no += Number(postalCodeData.muscle_pain_no);
    resultsByPostalCode[postalCode].muscle_pain_yes += Number(postalCodeData.muscle_pain_yes);
    resultsByPostalCode[postalCode].headache_no += Number(postalCodeData.headache_no);
    resultsByPostalCode[postalCode].headache_yes += Number(postalCodeData.headache_yes);
    resultsByPostalCode[postalCode].sore_throat_no += Number(postalCodeData.sore_throat_no);
    resultsByPostalCode[postalCode].sore_throat_yes += Number(postalCodeData.sore_throat_yes);
    resultsByPostalCode[postalCode].rhinitis_no += Number(postalCodeData.rhinitis_no);
    resultsByPostalCode[postalCode].rhinitis_yes += Number(postalCodeData.rhinitis_yes);
    resultsByPostalCode[postalCode].stomach_issues_no += Number(postalCodeData.stomach_issues_no);
    resultsByPostalCode[postalCode].stomach_issues_yes += Number(postalCodeData.stomach_issues_yes);
    resultsByPostalCode[postalCode].sensory_issues_no += Number(postalCodeData.sensory_issues_no);
    resultsByPostalCode[postalCode].sensory_issues_yes += Number(postalCodeData.sensory_issues_yes);
    resultsByPostalCode[postalCode].longterm_medication_no += Number(postalCodeData.longterm_medication_no);
    resultsByPostalCode[postalCode].longterm_medication_yes += Number(postalCodeData.longterm_medication_yes);
    resultsByPostalCode[postalCode].smoking_no += Number(postalCodeData.smoking_no);
    resultsByPostalCode[postalCode].smoking_yes += Number(postalCodeData.smoking_yes);
    resultsByPostalCode[postalCode].corona_suspicion_no += Number(postalCodeData.corona_suspicion_no);
    resultsByPostalCode[postalCode].corona_suspicion_yes += Number(postalCodeData.corona_suspicion_yes);
  }

  return resultsByPostalCode;
}

export type ResultsByPostalCode = ReturnType<typeof accumulateResultsByPostalCode>;

// NOTE: Filtering happens by setting all values to -1
export function filterResultsByPostalCode(
  resultsByPostalCode: ResultsByPostalCode,
  fn: (postalCodeData: PostalCodeLevelGeneralResult) => boolean,
) {
  const filteredResultsByPostalCode: ResultsByPostalCode = {};

  for (const [key, postalCodeData] of Object.entries(resultsByPostalCode)) {
    if (fn(postalCodeData)) {
      filteredResultsByPostalCode[key] = { ...postalCodeData };
    } else {
      filteredResultsByPostalCode[key] = {
        ...postalCodeData,
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

  return filteredResultsByPostalCode;
}

//
// Push

export async function pushPostalCodeLevelGeneralResults(
  app: App,
  postalCodeLevelGeneralResults: PostalCodeLevelGeneralResults,
) {
  return s3PutJsonHelper(app.s3Client, {
    Bucket: app.constants.openDataBucket,
    Key: app.constants.postalCodeLevelGeneralResultsKey,
    Body: {
      meta: {
        description:
          'Population and response count per each postal code area in Finland, where the response count was higher than 10. All the form inputs are coded in postal code level. Population data from Tilastokeskus. This data is released for journalistic and scientific purposes.',
        generated: new Date().toISOString(),
        link: `https://${app.constants.domainName}/${app.constants.postalCodeLevelGeneralResultsKey}`,
      },
      data: postalCodeLevelGeneralResults,
    },
  });
}
