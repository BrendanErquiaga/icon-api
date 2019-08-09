const httpResponse = require('../utils/httpResponse.js');
const constants = require('../utils/constants.js');
const AWS = require('aws-sdk');
const requestPromise = require('request-promise-native');

let s3 = new AWS.S3();
exports.getIcon = async (event, context) => {
  console.log("Getting icon: " + event.pathParameters.id);

  let objectKeyPrefix = constants.ICON_FOLDER_PATH + '/' + event.pathParameters.id + constants.ICON_NAME_ENDING_CHAR;
  let queryParams = event.queryStringParameters;
  let listParams = {
    Bucket: process.env.ICON_BUCKET,
    Prefix: objectKeyPrefix
  };

  let listResponse = await ListObjects(listParams);

  console.log("List Response: " + JSON.stringify(listResponse));

  if(listResponse === null) {
    return httpResponse(500, "Error fetching icon");
  } else if(listResponse.Contents.length === 0) {
    console.log("icon not found, creating a new one");
    let createdIconResponse = await CreateAndGetIcon(event.pathParameters.id);
    return httpResponse(201, PullCreatedIconLocationsOut(createdIconResponse), true);
  } else {
    console.log("icon found!");
    let responseBody = await FormatIconResponse(listResponse, queryParams);
    return httpResponse(200, responseBody, true);
  }
}

function PullCreatedIconLocationsOut(createdIconResponse) {
  let iconLocations = [];

  createdIconResponse.forEach(function (icon) {
    iconLocations.push(icon.Location);
  });

  return iconLocations;
}

async function CreateAndGetIcon(iconName) {
  console.log("Creating icon: " + iconName);
  let iconAPIResponse = await IconAPIResponse(iconName, true);
  console.log("Icon API Response!");
  let filteredAPIResponse = FilterAPIResponse(iconAPIResponse);
  console.log("Filtered API: " + JSON.stringify(filteredAPIResponse));
  let fullIconResponse = [];
  let iconCount = 0;

  if(filteredAPIResponse.length > 1) {
    await asyncForEach(filteredAPIResponse, async (iconURL) => {
      let saveIconResponse = await SaveIcon(iconURL, iconName, iconCount);
      iconCount++;
      fullIconResponse.push(saveIconResponse);
    });
  }

  return fullIconResponse;
}

async function asyncForEach(array, callback) {
  for (let index = 0; index < array.length; index++) {
    await callback(array[index], index, array);
  }
}

async function SaveIcon(iconURL, iconName, iconCount) {
  let iconFileType = GetIconFileType(iconURL);
  let objectKey = constants.ICON_FOLDER_PATH + '/' + iconName + '.' + iconCount + '.' + iconFileType;
  console.log("IconKey: " + objectKey);

  let decodedImage = await GetBufferedImage(iconURL);
  let saveParams = {
    Body: decodedImage,
    Bucket: process.env.ICON_BUCKET,
    Key: objectKey,
    ContentType: 'image/' + iconFileType,
    ACL: 'public-read'
  };

  let saveResponse = await SaveObject(saveParams);

  return saveResponse;
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

function GetIconFileType(iconURL) {
  return iconURL.split('.').pop(); 
}

function FilterAPIResponse(apiResponse) {
  let iconPreviewURLs = [];

  apiResponse.icons.forEach(function (icon) {
    iconPreviewURLs.push(GetIconOfDesiredSize(icon));
  });

  return iconPreviewURLs;
}

function GetIconOfDesiredSize(icon, iconSize) {
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

async function ListObjects(listObjectsParams) {
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
