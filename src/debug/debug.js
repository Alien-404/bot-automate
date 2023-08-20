const loadCookiesFromFile = require('../libs/utils/cookies.util');

(async () => {
  const cookies = await loadCookiesFromFile();
  console.log(JSON.parse(cookies));
})();
