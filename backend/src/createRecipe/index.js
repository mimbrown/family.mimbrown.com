const { basePath, handleError, request, untransform } = require('./airtable');

exports.handler = event => request({
    method: 'POST',
    path: basePath,
  }, {
    records: [{
      fields: untransform(event),
    }],
  }).then(response => ({
    id: response.records[0].id,
  })).catch(handleError);
