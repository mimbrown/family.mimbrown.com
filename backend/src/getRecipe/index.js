const { basePath, handleError, request, transform } = require('./airtable');

exports.handler = event => request({
  method: 'GET',
  path: `${basePath}/${event.id}`,
}).then(transform).catch(handleError);
