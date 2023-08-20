function formatGroup(url) {
  // Remove any query parameters and fragments
  var baseURL = url.split('?')[0].split('#')[0];

  // Remove the trailing slash if present
  if (baseURL.endsWith('/')) {
    baseURL = baseURL.slice(0, -1);
  }

  return baseURL;
}

module.exports = formatGroup;
