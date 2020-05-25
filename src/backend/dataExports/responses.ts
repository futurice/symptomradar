import { App, s3PutJsonHelper } from '../app';
import { LowPopulationPostalCodes, PostalCodeCityMappings } from '../../common/model';

export async function exportResponses(app: App) {
  const responses = await fetchResponses(app);

  await pushResponses(app, responses);
}

export async function fetchResponses(app: App) {
  const responsesResult = await queryResponses(app);

  const postalCodeCityMappings = await app.s3Sources.fetchPostalCodeCityMappings();
  const lowPopulationPostalCodes = await app.s3Sources.fetchLowPopulationPostalCodes();

  const responses = mapResponses(responsesResult.Items, postalCodeCityMappings, lowPopulationPostalCodes);

  return responses;
}

interface ResponsesQuery {
  response_id: string;
  timestamp: string;
  participant_id: string;
  app_version: string;
  country_code: string;
  fever: string;
  cough: string;
  breathing_difficulties: string;
  muscle_pain: string;
  headache: string;
  sore_throat: string;
  rhinitis: string;
  stomach_issues: string;
  sensory_issues: string;
  healthcare_contact: string;
  general_wellbeing: string;
  longterm_medication: string;
  smoking: string;
  corona_suspicion: string;
  age_group: string;
  gender: string;
  postal_code: string;
  duration: string;
  abuse_score: string;
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
  postalCodeCityMappings: PostalCodeCityMappings,
  lowPopulationPostalCodes: LowPopulationPostalCodes,
) {
  // TODO: Map and filter the responses
  const outputs = [];

  for (const response of responses) {
    // Normalize postal code
    const postal_code = lowPopulationPostalCodes.data[response.postal_code] || response.postal_code;

    // Filter by valid postal areas
    // TODO: Use the new `postalcode_areas.json
    if (postal_code in postalCodeCityMappings.data) {
      // Filter keys
      const { response_id, app_version, abuse_score, ...output } = response;

      outputs.push({
        ...output,
        postal_code,
        // Timestamps to be shown to the hour
        timestamp: `${response.timestamp.slice(0, 13)}:00:00.000Z`,
        // Two age groups, _under 50_ and _over 50_
        age_group: Number(response.age_group) < 50 ? 'under50' : 'over50',
        // Two genders, male and female. Other genders coalesce to male
        gender: response.gender === 'female' ? 'female' : 'male',
        duration: Number(response.duration) || 0,
      });
    }
  }

  return outputs;
}

type Responses = ReturnType<typeof mapResponses>;

export async function pushResponses(app: App, responses: Responses) {
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
