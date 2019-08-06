const httpResponse = require('../utils/httpResponse.js');
const constants = require('../utils/constants.js');
const AWS = require('aws-sdk');

var s3 = new AWS.S3();
exports.saveToS3 = async (event, context) => {
  let objectKey = constants.ICON_FOLDER_PATH + '/testObject3.png';
  let decodedImage = Buffer.from(constants.IMAGE_BUFFER_EXAMPLE, 'base64');
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