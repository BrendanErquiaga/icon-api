const httpResponse = require('../utils/httpResponse.js');
const constants = require('../utils/constants.js');
const requestPromise = require('request-promise-native');


exports.getIconFromAPI = async (event, context) => {
  let requestURL = constants.ICON_API_U;
  requestURL += '?query=' + 'cat';
  requestURL += '&count=' + 5;
  requestURL += '&vector=' + 'true';
  // requestURL += '&style=' + 'Flat';
  requestURL += '&client_id=' + constants.ICON_API_I;
  requestURL += '&client_secret=' + constants.ICON_API_S;

  let iconAPIResponse = await IconAPIResponse(requestURL);

  return httpResponse(200, iconAPIResponse, true);
};

async function IconAPIResponse(queryParams) {
  let options = {
    method: 'GET',
    uri: 'https://' + constants.ICON_API_H + constants.ICON_API_U,
    qs: {
      client_id: constants.ICON_API_I,
      client_secret: constants.ICON_API_S,
      query: 'cat',
      count: 5,
      vector: 'true'
    },
    json:true
  }

  return requestPromise(options)
    .then(function(response) {
      return response;
    })
    .catch(function(error){
      console.log("ERR: " + error);
    });
}