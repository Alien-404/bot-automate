function compareUrlsIgnoreSid(url1, url2) {
  const url1WithoutSid = url1.replace(/&_nc_sid=[^&]+/, '');
  const url2WithoutSid = url2.replace(/&_nc_sid=[^&]+/, '');
  return url1WithoutSid === url2WithoutSid;
}

module.exports = compareUrlsIgnoreSid;
