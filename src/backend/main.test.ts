import { FrontendResponseModelT, BackendResponseModelT } from '../common/model';
import { prepareResponseForStorage, getStorageKey } from './main';

const cannedUuid = '5fa8764a-7337-11ea-96ca-d38ac3d1909b';
const incomingResponseSample: FrontendResponseModelT = {
  participant_id: 'b087641b-80e8-419e-9b7a-3b47c0a770d8',
  fever: 'no',
  cough: 'mild',
  breathing_difficulties: 'no',
  muscle_pain: 'no',
  headache: 'no',
  sore_throat: 'no',
  rhinitis: 'no',
  stomach_issues: 'no',
  sensory_issues: 'no',
  healthcare_contact: 'no',
  general_wellbeing: 'fine',
  duration: '1', // or null
  longterm_medication: 'no',
  smoking: 'no',
  corona_suspicion: 'no',
  age_group: '20',
  gender: 'other',
  postal_code: '00520',
};
const persistedResponseSample: BackendResponseModelT = {
  age_group: '20',
  app_version: 'v1.2',
  breathing_difficulties: 'no',
  corona_suspicion: 'no',
  cough: 'mild',
  country_code: 'FI',
  duration: 1,
  fever: 'no',
  gender: 'other',
  general_wellbeing: 'fine',
  headache: 'no',
  healthcare_contact: 'no',
  longterm_medication: 'no',
  muscle_pain: 'no',
  participant_id: 'v7vNU2UYRUXvmGPN/kUPlIgKY8Gr6Gbq9qYfJC+5CCU=',
  postal_code: '00520',
  response_id: cannedUuid,
  rhinitis: 'no',
  sensory_issues: 'no',
  smoking: 'no',
  sore_throat: 'no',
  stomach_issues: 'no',
  timestamp: '2020-03-31T10:08:00.000Z', // note the rounding to minute precision
};

describe('prepareResponseForStorage()', () => {
  it('works', () => {
    return prepareResponseForStorage(
      incomingResponseSample,
      'FI',
      () => cannedUuid,
      () => 1585649303678, // i.e. "2020-03-31T10:08:23.678Z"
    ).then(r => expect(r).toEqual(persistedResponseSample));
  });
});

describe('getStorageKey()', () => {
  it('works', () => {
    expect(getStorageKey(persistedResponseSample)).toEqual(`responses/raw/2020-03-31/10:08:00.000Z/${cannedUuid}.json`);
  });
});
