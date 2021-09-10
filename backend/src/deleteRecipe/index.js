const { basePath, handleError, request } = require('./airtable');

exports.handler = event => request({
    method: 'DELETE',
    path: `${basePath}/${event.id}`,
  }).then(response => ({
    id: response.records[0].id,
  })).catch(handleError);
