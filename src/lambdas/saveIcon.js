const httpResponse = require('../utils/httpResponse.js');
const constants = require('../utils/constants.js');
const requestPromise = require('request-promise-native');


exports.getIconFromAPI = async (event, context) => {
  let searchTerm = event.queryStringParameters.search || 'cat';
  let getVectorIconsOnly = event.queryStringParameters.vector || 'false';

  if (getVectorIconsOnly != 'true' || getVectorIconsOnly != 'false') {
    getVectorIconsOnly = 'false';
  }

  let iconAPIResponse = await IconAPIResponse(searchTerm, getVectorIconsOnly);
  let filteredAPIResponse = filterAPIResponse(iconAPIResponse);

  return httpResponse(200, filteredAPIResponse, true);
};

function filterAPIResponse(apiResponse) {
  let iconPreviewURLs = [];

  apiResponse.icons.forEach(function (icon) {
    iconPreviewURLs.push(getIconOfDesiredSize(icon));
  });

  return iconPreviewURLs;
}

function getIconOfDesiredSize(icon, iconSize) {
  let iconURL = "",
      desiredIconSize = iconSize || constants.DESIRED_ICON_SIZE;
  icon.raster_sizes.forEach(function (rasterSize) {
    if (rasterSize.size === desiredIconSize) {
      iconURL = rasterSize.formats[0].preview_url;
    }
  });

  return iconURL;
}

async function IconAPIResponse(searchTerm, getVectorIconsOnly) {
  let options = {
    method: 'GET',
    uri: 'https://' + constants.ICON_API_H + constants.ICON_API_U,
    qs: {
      client_id: constants.ICON_API_I,
      client_secret: constants.ICON_API_S,
      count: constants.ICON_API_ICON_COUNT,
      premium: 0,
      query: searchTerm,
      vector: getVectorIconsOnly
    },
    json: true
  }

  return requestPromise(options)
    .then(function (response) {
      return response;
    })
    .catch(function (error) {
      console.log("ERR: " + error);
    });
}