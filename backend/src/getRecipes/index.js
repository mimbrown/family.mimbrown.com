const { basePath, handleError, request, transform } = require('./airtable');

exports.handler = event => {
  const { query } = event;
  let path = basePath;
  if (query) {
    path += '?' + query;
  }
  return request({
    method: 'GET',
    path,
  }).then(response => {
    response.records = response.records.map(transform);
    return response;
  }).catch(handleError);
}
