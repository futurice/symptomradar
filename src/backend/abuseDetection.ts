type AbuseScore = {
  seen_ip_24h: number;
  seen_ua_24h: number;
  seen_ff_24h: number;
};

type Headers = { [name: string]: string };

export function performAbuseDetection(
  sourceIp: string,
  headers: Headers,
  secretPepper: Promise<string>,
  // Allow overriding non-deterministic parts in test code:
  timestamp = Date.now,
): Promise<AbuseScore> {
  return Promise.resolve({
    seen_ip_24h: 0,
    seen_ua_24h: 0,
    seen_ff_24h: 0,
  });
}
