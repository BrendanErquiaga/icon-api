const createHttpResponse = (statusCode, body, stringify) => {
  return stringify ? { statusCode, body: JSON.stringify(body) } : { statusCode, body: body }
}

module.exports = createHttpResponse;