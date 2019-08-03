const httpResponse = require('../utils/httpResponse.js');
const constants = require('../utils/constants.js');
const axios = require('axios');


exports.getIconFromAPI = async (event, context) => {
  var nf_token_url = "https://www.iconfinder.com/api/v3/oauth2/token";

  let requestURL = constants.ICON_API_U;
  requestURL += '?query=' + 'cat';
  requestURL += '&count=' + 5;
  requestURL += '&client_id=' + constants.ICON_API_I;
  requestURL += '&client_secret=' + constants.ICON_API_S;

  let iconAPIResponse = await IconAPIResponse(requestURL);
  
  return httpResponse(200, iconAPIResponse);
};

async function IconAPIResponse(url) {
  return new Promise((resolve, reject) => {
    axios.get(url)
      .then(response => {
        console.log(JSON.stringify(response));
        resolve(response);
      })
      .catch(err => {
        reject(err);
      });
  });
}