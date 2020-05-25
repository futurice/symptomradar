import { App, s3GetJsonHelper, AppConstants, s3PutJsonHelper } from '../app';
import { OpenDataModel } from '../../common/model';

type OpenDataIndex = Record<string, OpenDataModel<never>>;

const openDataConstantKeys: Array<keyof AppConstants> = [
  'totalResponsesKey',
  'cityLevelGeneralResultsKey',
  'cityLevelPastWeekGeneralResultsKey',
  'postalCodeLevelGeneralResultsKey',
  'dailyTotalsKey',
  'responsesFullKey',
  'lowPopulationPostalCodesKey',
  'populationPerCityKey',
  'postalCodeAreasKey',
  'postalCodeCityMappingsKey',
  'topoJsonFinlandSimplifiedKey',
  'topoJsonFinlandWithoutAlandKey',
];

export async function exportOpenDataIndex(app: App) {
  const openData = await fetchOpenDataIndex(app);

  await pushOpenDataIndex(app, openData);
}

export async function fetchOpenDataIndex(app: App) {
  const openDataIndex: OpenDataIndex = {};

  for (const constantKey of openDataConstantKeys) {
    const key = app.constants[constantKey];
    const data = await s3GetJsonHelper(app.s3Client, { Bucket: app.constants.openDataBucket, Key: key });
    openDataIndex[key] = data.meta;
  }

  const openData: OpenDataModel<OpenDataIndex> = {
    meta: {
      description: 'This is the open data site for the www.oiretutka.fi project',
      generated: new Date().toISOString(),
      link: `https://${app.constants.domainName}`,
    },
    data: openDataIndex,
  };

  return openData;
}

export async function pushOpenDataIndex(app: App, openData: OpenDataModel<OpenDataIndex>) {
  await s3PutJsonHelper(app.s3Client, {
    Bucket: app.constants.openDataBucket,
    Key: app.constants.openDataIndexKey,
    Body: openData,
  });
}
