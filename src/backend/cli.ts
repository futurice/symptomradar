import fs from 'fs';
import { promisify } from 'util';
import yargs from 'yargs';
import { createApp } from './app';
import { fetchOpenDataIndex } from './dataExports/openDataIndex';
import { fetchTotalResponses } from './dataExports/totalResponses';
import { fetchCityLevelGeneralResults } from './dataExports/cityLevelGeneralResults';
import { fetchCityLevelWeeklyGeneralResults } from './dataExports/cityLevelWeeklyGeneralResults';
import { fetchDailyTotals } from './dataExports/dailyTotals';

const writeFile = promisify(fs.writeFile);

const app = createApp();

const openDataFilenames = [
  app.constants.openDataIndexKey,
  app.constants.totalResponsesKey,
  app.constants.cityLevelGeneralResultsKey,
  app.constants.cityLevelWeeklyGeneralResultsKey,
  app.constants.dailyTotalsKey,
];

const dumpHandlers = {
  [app.constants.openDataIndexKey]: fetchOpenDataIndex,
  [app.constants.totalResponsesKey]: fetchTotalResponses,
  [app.constants.cityLevelGeneralResultsKey]: fetchCityLevelGeneralResults,
  [app.constants.cityLevelWeeklyGeneralResultsKey]: fetchCityLevelWeeklyGeneralResults,
  [app.constants.dailyTotalsKey]: fetchDailyTotals,
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
          choices: openDataFilenames,
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
  console.log('dump', args);

  const { filename, out } = args;

  const handler = dumpHandlers[filename];
  if (!handler) {
    throw Error(`Unknown filename "${filename}"`);
  }

  const data = await handler(app);
  const json = JSON.stringify(data, null, 2);

  if (out) {
    await writeFile(out, json, { encoding: 'utf-8' });
  } else {
    console.log(json);
  }
}
