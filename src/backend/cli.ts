import fs from 'fs';
import { promisify } from 'util';
import yargs from 'yargs';
import { createApp, App, AppConstants } from './app';
import { fetchOpenDataIndex, pushOpenDataIndex } from './dataExports/openDataIndex';
import { fetchTotalResponses, pushTotalResponses } from './dataExports/totalResponses';
import { fetchCityLevelGeneralResults, pushCityLevelGeneralResults } from './dataExports/cityLevelGeneralResults';
import {
  fetchCityLevelWeeklyGeneralResults,
  pushCityLevelWeeklyGeneralResults,
} from './dataExports/cityLevelWeeklyGeneralResults';
import { fetchDailyTotals, pushDailyTotals } from './dataExports/dailyTotals';
import {
  fetchPostalCodeLevelGeneralResults,
  pushPostalCodeLevelGeneralResults,
} from './dataExports/postalCodeLevelGeneralResults';

const writeFile = promisify(fs.writeFile);

const app = createApp();

interface DataExportHandler {
  fetch(app: App): Promise<any>;
  push(app: App, data: any): Promise<void>;
}

const dataExportHandlers: { [K in keyof AppConstants]?: DataExportHandler } = {
  [app.constants.openDataIndexKey]: {
    fetch: fetchOpenDataIndex,
    push: pushOpenDataIndex,
  },
  [app.constants.totalResponsesKey]: {
    fetch: fetchTotalResponses,
    push: pushTotalResponses,
  },
  [app.constants.cityLevelGeneralResultsKey]: {
    fetch: fetchCityLevelGeneralResults,
    push: pushCityLevelGeneralResults,
  },
  [app.constants.cityLevelWeeklyGeneralResultsKey]: {
    fetch: fetchCityLevelWeeklyGeneralResults,
    push: pushCityLevelWeeklyGeneralResults,
  },
  [app.constants.postalCodeLevelGeneralResultsKey]: {
    fetch: fetchPostalCodeLevelGeneralResults,
    push: pushPostalCodeLevelGeneralResults,
  },
  [app.constants.dailyTotalsKey]: { fetch: fetchDailyTotals, push: pushDailyTotals },
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
          describe: 'Filename to export',
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
        await dump(args as any);
      } catch (error) {
        console.error(error);
        process.exit(1);
      }
    },
  )
  .option('env', {
    describe: 'Environment to use',
    choices: ['dev', 'prod'],
    default: 'dev',
  }).argv;

interface DumpArgs extends CommonArgs {
  filename: string;
  out: string;
}

export async function dump(args: DumpArgs) {
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
