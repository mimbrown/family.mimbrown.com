const { basePath, handleError, request, untransform } = require('./airtable');

exports.handler = event => request({
    method: 'PATCH',
    path: `${basePath}/${event.id}`,
  }, {
    fields: untransform(event.fields),
  }).then(response => ({
    id: response.records[0].id,
  })).catch(handleError);
