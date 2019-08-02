const httpResponse = require('../utils/httpResponse.js');
const constants = require('../utils/constants.js');
const AWS = require('aws-sdk');

var s3 = new AWS.S3();
exports.getIcon = async (event, context) => {
  let objectKeyPrefix = constants.ICON_FOLDER_PATH + '/' + event.pathParameters.id + constants.ICON_NAME_ENDING_CHAR;
  let queryParams = event.queryStringParameters;
  let listParams = {
    Bucket: process.env.ICON_BUCKET,
    Prefix: objectKeyPrefix
  };

  let listResponse = await ListObjects(listParams);

  if(listResponse === null) {
    return httpResponse(500, "Error fetching icon");
  } else if(listResponse.Contents.length === 0) {
    return httpResponse(404, "Icon not found. Later one will be created");
  } else {
    let responseBody = await FormatIconResponse(listResponse, queryParams);
    return httpResponse(200, responseBody, true);
  }
};

async function FormatIconResponse(listResponse, queryParams) {
  if (queryParams && queryParams.list) {
    let iconList = [];
    for(let i = 0; i < listResponse.Contents.length; i++) {
      iconList.push(listResponse.Contents[i].Key);
    }
    return iconList;
  } else {
    return "http://" + process.env.ICON_BUCKET + '.s3.amazonaws.com/' + listResponse.Contents[0].Key;//TODO improve this so it never sends an alternate
  }
}

function ListObjects(listObjectsParams) {
  return new Promise((resolve, reject) => {
    s3.listObjectsV2(listObjectsParams, function (err, data) {
      if (err) {
        console.error(err);
        reject(err);
      } else {
        resolve(data);
      }
    });
  });
}

function GetImageIcon(imageKey) {
  let params = {
    Bucket: process.env.ICON_BUCKET,
    Key: imageKey
  }
  return new Promise((resolve, reject) => {
    s3.getObject(params, function(err, data) {
      if (err) {
        console.error(err);
        reject(err);
      } else {
        resolve(data);
      }
    })
  });
}
