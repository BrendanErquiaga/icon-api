const httpResponse = require('../utils/httpResponse.js');

exports.getIcon = async (event, context) => {
  let responseString = "Yea, you called get, here's the bucket name: " + process.env.ICON_BUCKET; 
  return httpResponse(200, responseString);
};
