import { first, last } from 'lodash';
import { DynamoDBClient, getStorageKey, getTimeRange, performAbuseDetection } from './abuseDetection';

// Available as event.requestContext.identity.sourceIp in the Lambda request handler
const sourceIp = '87.92.62.179';

// Available as event.headers in the Lambda request handler
const headers = {
  Accept:
    'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9',
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
  'User-Agent':
    'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/80.0.3987.163 Safari/537.36',
  Via: '2.0 7ddb2b9bba2e00f11b5de58d7aa1249c.cloudfront.net (CloudFront)',
  'X-Amz-Cf-Id': 'W06KV_M9t3WpFFvbR8Uy65yG5IKoNivgEa2Mvj4hespoqRIuXIdAOA==',
  'X-Amzn-Trace-Id': 'Root=1-5e8f1ea1-57f325cca78ac88b553f9d7d',
  'X-Forwarded-For': '87.92.62.179, 52.46.36.85',
  'X-Forwarded-Port': '443',
  'X-Forwarded-Proto': 'https',
};

describe('performAbuseDetection()', () => {
  it('works', () => {
    return performAbuseDetection(
      sourceIp,
      headers,
      Promise.resolve('fake-secret-pepper'),
      () => 1585649303678, // i.e. "2020-03-31T10:08:23.678Z"
    ).then(res => expect(res).toEqual({ seen_ip_24h: 0, seen_ua_24h: 0, seen_ff_24h: 0 }));
  });
});

describe('createMockDynamoDbClient()', () => {
  it('increments keys', () => {
    const client = createMockDynamoDbClient();
    return Promise.all(['key-01', 'key-01', 'key-03', 'key-04'].map(client.incrementKey)).then(res =>
      expect(res).toEqual([1, 2, 1, 1]),
    );
  });

  it('gets values', () => {
    const client = createMockDynamoDbClient();
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

export function createMockDynamoDbClient(): DynamoDBClient & { _storage: { [key: string]: number | undefined } } {
  const storage: { [key: string]: number | undefined } = {};
  return {
    incrementKey(key: string) {
      return Promise.resolve((storage[key] = (storage[key] || 0) + 1));
    },
    getValues(keys: string[]) {
      return Promise.resolve(keys.map(key => storage[key] || 0));
    },
    _storage: storage,
  };
}
