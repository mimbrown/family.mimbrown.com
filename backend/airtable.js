const https = require('https');

const fromMetaTag = keyValue => {
  const index = keyValue.indexOf(':');
  return {
    key: keyValue.slice(0, index),
    value: keyValue.slice(index + 1, keyValue.length),
  }
};

const toMetaTag = ({ key, value }) => `${key}:${value}`;

exports.transform = data => {
  const { fields } = data;
  fields.meta = fields.meta?.split('\n').map(fromMetaTag);
  fields.ingredients = fields.ingredients?.split('\n');
  fields.steps = fields.steps?.split('\n');
  return {
    id: data.id,
    createdTime: data.createdTime,
    ...fields,
  };
};

exports.untransform = fields => {
  fields.meta = fields.meta?.map(toMetaTag).join('\n');
  fields.ingredients = fields.ingredients?.join('\n');
  fields.steps = fields.steps?.join('\n');
  return fields;
};

exports.basePath = '/v0/appQgbNehusKJwTtc/Recipes';

const authorization = `Bearer ${process.env.AIRTABLE_API_KEY}`;

const transformCode = code => code >= 401 && code <= 403 ? 500 : code;

exports.handleError = err => err?.statusCode ? err : { statusCode: 500 };

/**
 * Make a request to the airtable API
 * @param {https.RequestOptions} options 
 * @param {object} [body] 
 * @returns
 */
exports.request = (options, body) => new Promise((resolve, reject) => {
  const headers = { authorization };
  let data;
  if (body) {
    data = JSON.stringify(body);
    headers['content-type'] = 'application/json';
  }
  const requestOptions = Object.assign({
    hostname: 'api.airtable.com',
    headers,
  }, options)
  const req = https.request(requestOptions, response => {
    const responseBuffer = [];
    response
      .on('data', chunk => {
        responseBuffer.push(chunk);
      })
      .on('error', err => reject({
        statusCode: 500,
        message: err.message,
      }))
      .on('end', () => {
        const { statusCode } = response;
        if (statusCode < 400) {
          const data = JSON.parse(
            Buffer.concat(responseBuffer).toString(),
          );
          resolve(data);
        } else {
          reject({
            statusCode: transformCode(statusCode),
          });
        }
      });
  }).on('error', err => reject({
    statusCode: 500,
    message: err.message,
  }));
  if (data) {
    req.write(data);
  }
  req.end();
});
