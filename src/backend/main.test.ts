import { BackendResponseModelT, FrontendResponseModelT } from '../common/model';
import { normalizeForwardedFor } from './abuseDetection';
import { createMockDynamoDbClient } from './abuseDetection.test';
import { APP_VERSION, getStorageKey, prepareResponseForStorage } from './main';

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
  app_version: APP_VERSION,
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
  participant_id: 'gJHfWrLSp+DHWEZHponianQCdWSR9svvD5niz9rRM1U=',
  postal_code: '00520',
  response_id: cannedUuid,
  rhinitis: 'no',
  sensory_issues: 'no',
  smoking: 'no',
  sore_throat: 'no',
  stomach_issues: 'no',
  timestamp: '2020-03-31T10:08:00.000Z', // note the rounding to minute precision
  abuse_score: {
    forwarded_for: -1, // i.e. ABUSE_SCORE_MISSING, because we didn't provide a "X-Forwarded-For" value to score
    source_ip: 0,
    user_agent: 0,
  },
};

describe('prepareResponseForStorage()', () => {
  it('works for the first request', () => {
    return prepareResponseForStorage(
      incomingResponseSample,
      'FI',
      createMockDynamoDbClient(),
      {
        source_ip: '1.1.1.1',
        user_agent: 'Mozilla/5.0...Safari/537.36',
        forwarded_for: normalizeForwardedFor('1.1.1.1, 52.46.36.85'),
      },
      Promise.resolve('fake-secret-pepper'),
      () => cannedUuid,
      () => 1585649303678, // i.e. "2020-03-31T10:08:23.678Z"
    ).then(r => expect(r).toEqual(persistedResponseSample));
  });

  it('works for a second request', () => {
    return prepareResponseForStorage(
      incomingResponseSample,
      'FI',
      {
        ...createMockDynamoDbClient(),
        getValues(keys: string[]) {
          return Promise.resolve([123, ...keys.map(() => 0)]);
        },
      },
      {
        source_ip: '1.1.1.1',
        user_agent: 'Mozilla/5.0...Safari/537.36',
        forwarded_for: normalizeForwardedFor('1.1.1.1, 52.46.36.85'),
      },
      Promise.resolve('fake-secret-pepper'),
      () => cannedUuid,
      () => 1585649303678, // i.e. "2020-03-31T10:08:23.678Z"
    ).then(r =>
      expect(r).toEqual({
        ...persistedResponseSample,
        abuse_score: { ...persistedResponseSample.abuse_score, source_ip: 123 },
      }),
    );
  });

  it('handles errors', () => {
    return prepareResponseForStorage(
      incomingResponseSample,
      'FI',
      {
        ...createMockDynamoDbClient(),
        getValues() {
          return Promise.reject(new Error('Simulated error in test suite'));
        },
      },
      {
        source_ip: '1.1.1.1',
        user_agent: 'Mozilla/5.0...Safari/537.36',
        forwarded_for: normalizeForwardedFor('1.1.1.1, 52.46.36.85'),
      },
      Promise.resolve('fake-secret-pepper'),
      () => cannedUuid,
      () => 1585649303678, // i.e. "2020-03-31T10:08:23.678Z"
    ).then(r =>
      expect(r).toEqual({
        ...persistedResponseSample,
        abuse_score: {
          forwarded_for: -2,
          source_ip: -2,
          user_agent: -2,
        },
      }),
    );
  });
});

describe('getStorageKey()', () => {
  it('works', () => {
    expect(getStorageKey(persistedResponseSample)).toEqual(`responses/raw/2020-03-31/10:08:00.000Z/${cannedUuid}.json`);
  });
});
