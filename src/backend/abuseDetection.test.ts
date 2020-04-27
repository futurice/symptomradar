import { first, identity, last } from 'lodash';
import { HOUR_IN_MS, MINUTE_IN_MS } from '../common/time';
import {
  AbuseFingerprint,
  AbuseDetectionDbClient,
  getStorageKey,
  getTimeRange,
  normalizeForwardedFor,
  performAbuseDetection,
} from './abuseDetection';
import { hash } from './main';
import { createMockAbuseDetectionDbClient } from './appMocks';

// Available as event.requestContext.identity.sourceIp in the Lambda request handler
const sourceIp = '87.92.62.179';

// Available as event.headers in the Lambda request handler
const headers = {
  Accept: 'text/html...signed-exchange;v=b3;q=0.9',
  'Accept-Encoding': 'gzip, deflate, br',
  'Accept-Language': 'en-US,en;q=0.9,fi;q=0.8',
  'CloudFront-Forwarded-Proto': 'https',
  'CloudFront-Is-Desktop-Viewer': 'true',
  'CloudFront-Is-Mobile-Viewer': 'false',
  'CloudFront-Is-SmartTV-Viewer': 'false',
  'CloudFront-Is-Tablet-Viewer': 'false',
  'CloudFront-Viewer-Country': 'FI',
  Host: 'api.dev.oiretutka.fi',
  'sec-fetch-mode': 'navigate',
  'sec-fetch-site': 'none',
  'sec-fetch-user': '?1',
  'upgrade-insecure-requests': '1',
  'User-Agent': 'Mozilla/5.0...Safari/537.36',
  Via: '2.0 7ddb2b9bba2e00f11b5de58d7aa1249c.cloudfront.net (CloudFront)',
  'X-Amz-Cf-Id': 'W06KV_M9t3WpFFvbR8Uy65yG5IKoNivgEa2Mvj4hespoqRIuXIdAOA==',
  'X-Amzn-Trace-Id': 'Root=1-5e8f1ea1-57f325cca78ac88b553f9d7d',
  'X-Forwarded-For': '87.92.62.179, 52.46.36.85',
  'X-Forwarded-Port': '443',
  'X-Forwarded-Proto': 'https',
};

describe('performAbuseDetection()', () => {
  [false, true].forEach(withHashing =>
    describe(`with${withHashing ? '' : 'out'} hashing`, () => {
      // This suite is repeated for both configurations, to check it works the same

      async function request(abuseDetectionDb: AbuseDetectionDbClient, fingerprint: AbuseFingerprint, time = 0) {
        const { readPromise, writePromise } = performAbuseDetection(
          abuseDetectionDb,
          fingerprint,
          withHashing ? x => hash(x, 'fake-secret-pepper') : identity,
          () => 1585649303678 + time, // i.e. "2020-03-31T10:08:23.678Z"
          3, // only operate on 3 hours' range for the test suite
        );

        const [readResult] = await Promise.all([readPromise, writePromise]);
        return readResult;
      }

      const sampleReq1 = {
        source_ip: sourceIp,
        user_agent: headers['User-Agent'],
        forwarded_for: normalizeForwardedFor(headers['X-Forwarded-For']),
      };

      const sampleReq2 = {
        ...sampleReq1,
        source_ip: '123.123.123.123',
      };

      const sampleReq3 = {
        ...sampleReq1,
        forwarded_for: normalizeForwardedFor('50.50.50.50, 12.12.12.12, 87.92.62.179, 52.46.36.172'),
      };

      it('works for the first request', async () => {
        const abuseDetectionDb = createMockAbuseDetectionDbClient();
        const score = await request(abuseDetectionDb, sampleReq1);
        expect(score).toEqual({
          source_ip: 0,
          user_agent: 0,
          forwarded_for: -1, // i.e. ABUSE_SCORE_MISSING, because we didn't provide a "X-Forwarded-For" value to score
        });
        withHashing || // only assert storage contents when they're legible
          expect(abuseDetectionDb._storage).toEqual({
            '2020-03-31T10Z/source_ip/87.92.62.179': 1,
            '2020-03-31T10Z/user_agent/Mozilla/5.0...Safari/537.36': 1,
          });
      });

      it('works for subsequent requests', async () => {
        const abuseDetectionDb = createMockAbuseDetectionDbClient();
        await request(abuseDetectionDb, sampleReq1);
        await request(abuseDetectionDb, sampleReq1, MINUTE_IN_MS);
        const score = await request(abuseDetectionDb, sampleReq1, MINUTE_IN_MS * 10);
        expect(score).toEqual({
          source_ip: 2,
          user_agent: 2,
          forwarded_for: -1, // i.e. ABUSE_SCORE_MISSING, because we didn't provide a "X-Forwarded-For" value to score
        });
        withHashing ||
          expect(abuseDetectionDb._storage).toEqual({
            '2020-03-31T10Z/source_ip/87.92.62.179': 3,
            '2020-03-31T10Z/user_agent/Mozilla/5.0...Safari/537.36': 3,
          });
      });

      it('works for mixed requests', async () => {
        const abuseDetectionDb = createMockAbuseDetectionDbClient();
        await request(abuseDetectionDb, sampleReq1);
        await request(abuseDetectionDb, sampleReq2);
        await request(abuseDetectionDb, sampleReq1, MINUTE_IN_MS);
        await request(abuseDetectionDb, sampleReq2, MINUTE_IN_MS * 2);
        const score = await request(abuseDetectionDb, sampleReq1, MINUTE_IN_MS * 10);
        expect(score).toEqual({
          source_ip: 2,
          user_agent: 4, // all requests have had the same UA, even if they had a different IP
          forwarded_for: -1, // i.e. ABUSE_SCORE_MISSING, because we didn't provide a "X-Forwarded-For" value to score
        });
        withHashing ||
          expect(abuseDetectionDb._storage).toEqual({
            '2020-03-31T10Z/source_ip/87.92.62.179': 3,
            '2020-03-31T10Z/source_ip/123.123.123.123': 2,
            '2020-03-31T10Z/user_agent/Mozilla/5.0...Safari/537.36': 5,
          });
      });

      it('works for requests spread over multiple hours', async () => {
        const abuseDetectionDb = createMockAbuseDetectionDbClient();
        await request(abuseDetectionDb, sampleReq1);
        await request(abuseDetectionDb, sampleReq1, HOUR_IN_MS);
        const score = await request(abuseDetectionDb, sampleReq1, HOUR_IN_MS * 2);
        expect(score).toEqual({
          source_ip: 2,
          user_agent: 2,
          forwarded_for: -1, // i.e. ABUSE_SCORE_MISSING, because we didn't provide a "X-Forwarded-For" value to score
        });
        withHashing ||
          expect(abuseDetectionDb._storage).toEqual({
            '2020-03-31T10Z/source_ip/87.92.62.179': 1,
            '2020-03-31T11Z/source_ip/87.92.62.179': 1,
            '2020-03-31T12Z/source_ip/87.92.62.179': 1,
            '2020-03-31T10Z/user_agent/Mozilla/5.0...Safari/537.36': 1,
            '2020-03-31T11Z/user_agent/Mozilla/5.0...Safari/537.36': 1,
            '2020-03-31T12Z/user_agent/Mozilla/5.0...Safari/537.36': 1,
          });
      });

      it('works for requests going over the time range', async () => {
        const abuseDetectionDb = createMockAbuseDetectionDbClient();
        await request(abuseDetectionDb, sampleReq1, HOUR_IN_MS * 0); // by the time we expect(), this will be too told to be counted!
        await request(abuseDetectionDb, sampleReq1, HOUR_IN_MS * 1); // ^ ditto
        await request(abuseDetectionDb, sampleReq1, HOUR_IN_MS * 2); // ^ ditto
        await request(abuseDetectionDb, sampleReq1, HOUR_IN_MS * 3);
        await request(abuseDetectionDb, sampleReq1, HOUR_IN_MS * 4);
        const score = await request(abuseDetectionDb, sampleReq1, HOUR_IN_MS * 5);
        expect(score).toEqual({
          source_ip: 2,
          user_agent: 2,
          forwarded_for: -1, // i.e. ABUSE_SCORE_MISSING, because we didn't provide a "X-Forwarded-For" value to score
        });
        withHashing ||
          expect(abuseDetectionDb._storage).toEqual({
            '2020-03-31T10Z/source_ip/87.92.62.179': 1,
            '2020-03-31T11Z/source_ip/87.92.62.179': 1,
            '2020-03-31T12Z/source_ip/87.92.62.179': 1,
            '2020-03-31T13Z/source_ip/87.92.62.179': 1,
            '2020-03-31T14Z/source_ip/87.92.62.179': 1,
            '2020-03-31T15Z/source_ip/87.92.62.179': 1,
            '2020-03-31T10Z/user_agent/Mozilla/5.0...Safari/537.36': 1,
            '2020-03-31T11Z/user_agent/Mozilla/5.0...Safari/537.36': 1,
            '2020-03-31T12Z/user_agent/Mozilla/5.0...Safari/537.36': 1,
            '2020-03-31T13Z/user_agent/Mozilla/5.0...Safari/537.36': 1,
            '2020-03-31T14Z/user_agent/Mozilla/5.0...Safari/537.36': 1,
            '2020-03-31T15Z/user_agent/Mozilla/5.0...Safari/537.36': 1,
          });
      });

      it('works for mixed requests going over the time range', async () => {
        const abuseDetectionDb = createMockAbuseDetectionDbClient();
        await request(abuseDetectionDb, sampleReq1, HOUR_IN_MS * 0); // by the time we expect(), this will be too told to be counted!
        await request(abuseDetectionDb, sampleReq2, HOUR_IN_MS * 1); // ^ ditto
        await request(abuseDetectionDb, sampleReq1, HOUR_IN_MS * 2); // ^ ditto
        await request(abuseDetectionDb, sampleReq2, HOUR_IN_MS * 3);
        await request(abuseDetectionDb, sampleReq1, HOUR_IN_MS * 4);
        const score = await request(abuseDetectionDb, sampleReq2, HOUR_IN_MS * 5);
        expect(score).toEqual({
          source_ip: 1, // only once from this distinct IP
          user_agent: 2, // but twice with this UA
          forwarded_for: -1, // i.e. ABUSE_SCORE_MISSING, because we didn't provide a "X-Forwarded-For" value to score
        });
        withHashing ||
          expect(abuseDetectionDb._storage).toEqual({
            '2020-03-31T10Z/source_ip/87.92.62.179': 1,
            '2020-03-31T11Z/source_ip/123.123.123.123': 1,
            '2020-03-31T12Z/source_ip/87.92.62.179': 1,
            '2020-03-31T13Z/source_ip/123.123.123.123': 1,
            '2020-03-31T14Z/source_ip/87.92.62.179': 1,
            '2020-03-31T15Z/source_ip/123.123.123.123': 1,
            '2020-03-31T10Z/user_agent/Mozilla/5.0...Safari/537.36': 1,
            '2020-03-31T11Z/user_agent/Mozilla/5.0...Safari/537.36': 1,
            '2020-03-31T12Z/user_agent/Mozilla/5.0...Safari/537.36': 1,
            '2020-03-31T13Z/user_agent/Mozilla/5.0...Safari/537.36': 1,
            '2020-03-31T14Z/user_agent/Mozilla/5.0...Safari/537.36': 1,
            '2020-03-31T15Z/user_agent/Mozilla/5.0...Safari/537.36': 1,
          });
      });

      it('works for requests with X-Forwarded-For', async () => {
        const abuseDetectionDb = createMockAbuseDetectionDbClient();
        await request(abuseDetectionDb, sampleReq3);
        await request(abuseDetectionDb, sampleReq3, MINUTE_IN_MS * 1);
        const score = await request(abuseDetectionDb, sampleReq3, MINUTE_IN_MS * 2);
        expect(score).toEqual({
          source_ip: 2,
          user_agent: 2,
          forwarded_for: 2,
        });
        withHashing ||
          expect(abuseDetectionDb._storage).toEqual({
            '2020-03-31T10Z/source_ip/87.92.62.179': 3,
            '2020-03-31T10Z/user_agent/Mozilla/5.0...Safari/537.36': 3,
            '2020-03-31T10Z/forwarded_for/50.50.50.50, 12.12.12.12': 3,
          });
      });

      it('works for requests with varying X-Forwarded-For', async () => {
        const abuseDetectionDb = createMockAbuseDetectionDbClient();
        const clientBehindProxy = (ip: string) => ({
          ...sampleReq3,
          forwarded_for: normalizeForwardedFor(`${ip}, 87.92.62.179, 52.46.36.172`),
          user_agent: `FakeBrowser/${ip}`,
        });
        await request(abuseDetectionDb, clientBehindProxy('1.1.1.1'), MINUTE_IN_MS * 0);
        await request(abuseDetectionDb, clientBehindProxy('2.2.2.2'), MINUTE_IN_MS * 1);
        await request(abuseDetectionDb, clientBehindProxy('2.2.2.2'), MINUTE_IN_MS * 2);
        await request(abuseDetectionDb, clientBehindProxy('3.3.3.3'), MINUTE_IN_MS * 3);
        await request(abuseDetectionDb, clientBehindProxy('3.3.3.3'), MINUTE_IN_MS * 4);
        const score = await request(abuseDetectionDb, clientBehindProxy('3.3.3.3'), MINUTE_IN_MS * 5);
        expect(score).toEqual({
          source_ip: 5, // all requests came from the same "real" IP
          user_agent: 2, // last 3 had the same UA
          forwarded_for: 2, // and the same FF
        });
        withHashing ||
          expect(abuseDetectionDb._storage).toEqual({
            '2020-03-31T10Z/forwarded_for/1.1.1.1': 1,
            '2020-03-31T10Z/forwarded_for/2.2.2.2': 2,
            '2020-03-31T10Z/forwarded_for/3.3.3.3': 3,
            '2020-03-31T10Z/source_ip/87.92.62.179': 6,
            '2020-03-31T10Z/user_agent/FakeBrowser/1.1.1.1': 1,
            '2020-03-31T10Z/user_agent/FakeBrowser/2.2.2.2': 2,
            '2020-03-31T10Z/user_agent/FakeBrowser/3.3.3.3': 3,
          });
      });
    }),
  );
});

describe('createMockAbuseDetectionDbClient()', () => {
  it('increments keys', () => {
    const client = createMockAbuseDetectionDbClient();
    return Promise.all(['key-01', 'key-01', 'key-03', 'key-04'].map(client.incrementKey)).then(res =>
      expect(res).toEqual([1, 2, 1, 1]),
    );
  });

  it('gets values', () => {
    const client = createMockAbuseDetectionDbClient();
    return Promise.all(['key-01', 'key-01', 'key-03', 'key-04'].map(client.incrementKey))
      .then(() => client.getValues(['key-01', 'key-02', 'key-03', 'key-04']))
      .then(res => expect(res).toEqual([2, 0, 1, 1]));
  });
});

describe('getStorageKey()', () => {
  it('works', () => {
    expect(
      getStorageKey(
        'source-ip',
        '87.92.62.179',
        1586857707869, // 2020-04-14T09:48:27.869Z
      ),
    ).toEqual('2020-04-14T09Z/source-ip/87.92.62.179');
  });
});

describe('getTimeRange()', () => {
  it('has the correct number of items', () => {
    expect(getTimeRange(1586857707869).length).toEqual(24);
  });

  it('has the correct start and end timestamps', () => {
    const range = getTimeRange(1586857707869).map(ts => new Date(ts).toISOString());
    expect(first(range)).toEqual('2020-04-13T10:48:27.869Z');
    expect(last(range)).toEqual('2020-04-14T09:48:27.869Z');
  });
});

describe('normalizeForwardedFor()', () => {
  it('works when omitted', () => {
    expect(normalizeForwardedFor()).toEqual('');
  });

  it('works without additional proxies', () => {
    expect(normalizeForwardedFor('87.92.62.179, 52.46.36.85')).toEqual('');
  });

  it('works with additional proxies', () => {
    expect(normalizeForwardedFor('50.50.50.50, 12.12.12.12, 87.92.62.179, 52.46.36.172')).toEqual(
      '50.50.50.50, 12.12.12.12',
    );
  });
});
