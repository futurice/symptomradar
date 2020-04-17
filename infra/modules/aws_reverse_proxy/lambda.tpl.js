'use strict';

// Lambda@Edge doesn't support environment variables, so this config will be expanded from a Terraform template
const config = ${config};
const addResponseHeaders = ${add_response_headers};
const validCredentials = config.basic_auth_username + ':' + config.basic_auth_password;
const validAuthHeader = 'Basic ' + Buffer.from(validCredentials).toString('base64');
const hstsHeaders =
  config.hsts_max_age && config.viewer_https_only
    ? { 'Strict-Transport-Security': 'max-age=' + config.hsts_max_age + '; preload' }
    : {}; // don't send HSTS headers when vanilla HTTP is allowed, as that'll make the vanilla HTTP site unavailable for anyone having visited the HTTPS one!

log('aws_reverse_proxy.config', { config, addResponseHeaders });

// Handle incoming request from the client
exports.viewer_request = (event, context, callback) => {
  const request = event.Records[0].cf.request;
  const headers = request.headers;

  log('aws_reverse_proxy.viewer_request.before', request);

  if (config.override_response_code && config.override_response_status && config.override_response_body) {
    const response = {
      status: config.override_response_code,
      statusDescription: config.override_response_status,
      body: config.override_response_body,
      headers: {
        ...formatHeaders(hstsHeaders),
        ...formatHeaders(addResponseHeaders),
      },
    };
    callback(null, response); // reply to the client with the overridden content, and don't forward request to origin at all
    log('aws_reverse_proxy.viewer_request.after', response);
  } else if (
    (config.basic_auth_username || config.basic_auth_password) &&
    (typeof headers.authorization == 'undefined' || headers.authorization[0].value != validAuthHeader) &&
    !(request.method === 'OPTIONS' && getHeader(headers, 'access-control-request-method')) // as per the CORS spec, pre-flight requests are sent without credentials (https://stackoverflow.com/a/15734032) -> always allow them
  ) {
    const response = {
      status: '401',
      statusDescription: 'Unauthorized',
      body: config.basic_auth_body,
      headers: {
        ...formatHeaders(hstsHeaders),
        ...formatHeaders(addResponseHeaders),
        ...formatHeaders({
          'WWW-Authenticate': 'Basic realm="' + config.basic_auth_realm + '", charset="UTF-8"',
        }),
      },
    };
    callback(null, response); // reply to the client with Unauthorized, and don't forward request to origin
    log('aws_reverse_proxy.viewer_request.after', response);
  } else {
    callback(null, request); // allow the request to be forwarded to origin normally
    log('aws_reverse_proxy.viewer_request.after', 'OK');
  }
};

// Handle outgoing response to the client
exports.origin_response = (event, context, callback) => {
  const response = event.Records[0].cf.response;

  log('aws_reverse_proxy.origin_response.before', response);

  // Add any additional headers:
  response.headers = {
    ...formatHeaders(hstsHeaders),
    ...response.headers,
    ...formatHeaders(addResponseHeaders),
  };

  // Remove headers that have an override value of "" completely:
  Object.keys(addResponseHeaders).forEach(header => {
    if (!addResponseHeaders[header]) delete response.headers[header.toLowerCase()];
  });

  // Override status code (if so configured):
  if (!config.override_only_on_code || new RegExp(config.override_only_on_code).test(response.status)) {
    response.status = config.override_response_code || response.status;
    response.statusDescription = config.override_response_status || response.statusDescription;
  }

  log('aws_reverse_proxy.origin_response.after', response);

  callback(null, response);
};

// Outputs incoming/outgoing requests for debugging
function log(label, meta) {
  console.log(label, require('util').inspect(meta, false, 10, false));
}

// Converts a set of headers into the rather-verbose format CloudFront expects; headers with "" as the value are dropped
function formatHeaders(headers) {
  return Object.keys(headers)
    .filter(next => headers[next] !== '')
    .reduce(
      (memo, next) =>
        Object.assign(memo, {
          [next.toLowerCase()]: [{ key: next, value: headers[next] }],
        }),
      {},
    );
}

// Reads a header value (very safely) from the CloudFront-formatted headers object
function getHeader(headers, key) {
  return headers[key] && headers[key][0] && headers[key][0].value || '';
}
