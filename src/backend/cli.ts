import fs from 'fs';
import { promisify } from 'util';
import yargs from 'yargs';
import { createApp, App, AppConstants } from './app';
import { fetchOpenDataIndex, pushOpenDataIndex } from './dataExports/openDataIndex';
import { fetchTotalResponses, pushTotalResponses, totalResponsesQuery } from './dataExports/totalResponses';
import { fetchCityLevelGeneralResults, pushCityLevelGeneralResults } from './dataExports/cityLevelGeneralResults';
import {
  fetchCityLevelPastWeekGeneralResults,
  pushCityLevelPastWeekGeneralResults,
  postalCodeLevelWeeklyGeneralResultsQuery,
} from './dataExports/cityLevelPastWeekGeneralResults';
import { fetchDailyTotals, pushDailyTotals, dailyTotalsQuery } from './dataExports/dailyTotals';
import {
  fetchPostalCodeLevelGeneralResults,
  pushPostalCodeLevelGeneralResults,
  postalCodeLevelGeneralResultsQuery,
} from './dataExports/postalCodeLevelGeneralResults';
import {
  fetchCityLevelDailyTotals,
  pushCityLevelDailyTotals,
  postalCodeLevelDailyTotalsQuery,
} from './dataExports/cityLevelDailyTotals';

const writeFile = promisify(fs.writeFile);

const app = createApp();

interface DataExportHandler {
  fetch(app: App): Promise<any>;
  push(app: App, data: any): Promise<void>;
  query?: string;
}

const dataExportHandlers: { [K in keyof AppConstants]?: DataExportHandler } = {
  [app.constants.openDataIndexKey]: {
    fetch: fetchOpenDataIndex,
    push: pushOpenDataIndex,
  },
  [app.constants.totalResponsesKey]: {
    fetch: fetchTotalResponses,
    push: pushTotalResponses,
    query: totalResponsesQuery,
  },
  [app.constants.cityLevelGeneralResultsKey]: {
    fetch: fetchCityLevelGeneralResults,
    push: pushCityLevelGeneralResults,
    query: postalCodeLevelGeneralResultsQuery,
  },
  [app.constants.cityLevelPastWeekGeneralResultsKey]: {
    fetch: fetchCityLevelPastWeekGeneralResults,
    push: pushCityLevelPastWeekGeneralResults,
    query: postalCodeLevelWeeklyGeneralResultsQuery,
  },
  [app.constants.postalCodeLevelGeneralResultsKey]: {
    fetch: fetchPostalCodeLevelGeneralResults,
    push: pushPostalCodeLevelGeneralResults,
    query: postalCodeLevelGeneralResultsQuery,
  },
  [app.constants.dailyTotalsKey]: { fetch: fetchDailyTotals, push: pushDailyTotals, query: dailyTotalsQuery },

  [app.constants.cityLevelDailyTotalsKey]: {
    fetch: fetchCityLevelDailyTotals,
    push: pushCityLevelDailyTotals,
    query: postalCodeLevelDailyTotalsQuery,
  },
};

interface CommonArgs {
  env: 'dev' | 'prod';
}

// eslint-disable-next-line @typescript-eslint/no-unused-expressions
yargs
  .command(
    'dump [filename]',
    'Create a local dump from open data export',
    yargs => {
      yargs
        .positional('filename', {
          describe: 'Filename of open data file',
          choices: Object.keys(dataExportHandlers),
        })
        .option('out', {
          alias: 'o',
          describe: 'Output filename. If not specified, dump is printed to stdout',
          type: 'string',
        });
    },
    async args => {
      try {
        await dumpCommand(args as any);
      } catch (error) {
        console.error(error);
        process.exit(1);
      }
    },
  )
  .command(
    'export [filename]',
    'Fetch data and export open data dump to S3',
    yargs => {
      yargs.positional('filename', {
        describe: 'Filename of open data file',
        choices: Object.keys(dataExportHandlers),
      });
    },
    async args => {
      try {
        await exportCommand(args as any);
      } catch (error) {
        console.error(error);
        process.exit(1);
      }
    },
  )
  .command(
    'show-query [filename]',
    'Shows Athena query for given data file',
    yargs => {
      yargs.positional('filename', {
        describe: 'Filename of open data file',
        choices: Object.keys(dataExportHandlers),
      });
    },
    async args => {
      try {
        await showQueryCommand(args as any);
      } catch (error) {
        console.error(error);
        process.exit(1);
      }
    },
  ).argv;

interface DumpArgs extends CommonArgs {
  filename: string;
  out: string;
}

export async function dumpCommand(args: DumpArgs) {
  const { filename, out } = args;

  const handler = dataExportHandlers[filename as keyof AppConstants];
  if (!handler) {
    throw Error(`Unknown filename "${filename}"`);
  }

  const data = await handler.fetch(app);
  const json = JSON.stringify(data, null, 2);

  if (out) {
    await writeFile(out, json, { encoding: 'utf-8' });
  } else {
    console.log(json);
  }
}

interface ExportArgs extends CommonArgs {
  filename: string;
}

export async function exportCommand(args: ExportArgs) {
  const { filename } = args;

  const handler = dataExportHandlers[filename as keyof AppConstants];
  if (!handler) {
    throw Error(`Unknown filename "${filename}"`);
  }

  const data = await handler.fetch(app);
  await handler.push(app, data);

  console.log(`Exported "${filename}"`);
}

export async function showQueryCommand(args: ExportArgs) {
  const { filename } = args;

  const handler = dataExportHandlers[filename as keyof AppConstants];
  if (!handler) {
    throw Error(`Unknown filename "${filename}"`);
  }

  if (handler.query) {
    console.log(handler.query);
  }
}
