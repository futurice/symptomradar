import { App, s3GetJsonHelper, AppConstants, s3PutJsonHelper } from '../app';

const openDataConstantKeys: Array<keyof AppConstants> = [
  'totalResponsesKey',
  'cityLevelGeneralResultsKey',
  'dailyTotalsKey',
  'lowPopulationPostalCodesKey',
  'populationPerCityKey',
  'postalCodeCityMappingsKey',
  'topoJsonFinlandSimplifiedKey',
  'topoJsonFinlandWithoutAlandKey',
];

export async function exportOpenDataIndex(app: App) {
  //
  // Fetch data files

  // TODO: Model these (meta: OpenDataMeta, data: T = any)
  const openDataIndex: Record<string, any> = {};

  for (const constantKey of openDataConstantKeys) {
    const key = app.constants[constantKey];
    const data = await s3GetJsonHelper(app.s3Client, { Bucket: app.constants.openDataBucket, Key: key });
    openDataIndex[key] = data.meta;
  }

  const openData = {
    meta: {
      description: 'This is the open data site for the www.oiretutka.fi project',
      generated: new Date().toISOString(),
      link: `https://${app.constants.domainName}`,
    },
    data: openDataIndex,
  };

  await s3PutJsonHelper(app.s3Client, { Bucket: app.constants.openDataBucket, Key: 'index.json', Body: openData });
}
