const httpResponse = require('../utils/httpResponse.js');
const constants = require('../utils/constants.js');
const AWS = require('aws-sdk');
const requestPromise = require('request-promise-native');

var s3 = new AWS.S3();
exports.saveToS3 = async (event, context) => {
  let objectKey = constants.ICON_FOLDER_PATH + '/testObject3.png';
  
  let decodedImage = await GetBufferedImage('https://cdn4.iconfinder.com/data/icons/small-n-flat/24/cat-64.png');
  let saveParams = {
    Body: decodedImage,
    Bucket: process.env.ICON_BUCKET,
    Key: objectKey,
    ContentType: 'image/png',
    ACL: 'public-read'
  };

  let saveResponse = await SaveObject(saveParams);

  return httpResponse(200, saveResponse, true);
}

async function GetBufferedImage(imageURL) {
  let imageResponse = await ImageResponse(imageURL);
  return Buffer.from(imageResponse, 'base64');
}

async function ImageResponse(imageURL) {
  let params = {
    method: 'GET',
    uri: imageURL,
    encoding: null
  }

  return requestPromise(params)
    .then(function (response) {
      return response;
    })
    .catch(function (error) {
      console.log("ERR: " + error);
    });
}

function SaveObject(saveObjectParams) {
  return new Promise((resolve, reject) => {
    s3.upload(saveObjectParams, function (err, data) {
      if (err) {
        console.error(err);
        reject(err);
      } else {
        resolve(data);
      }
    });
  });
}