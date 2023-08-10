const bcrypt = require('bcrypt');
const key = process.argv[2];

(async () => {
  const valid = await bcrypt.compare(
    '712371',
    '$2a$12$IXYOhSk8/6mT6Uo2av91Le71b5mUPCkta4Jhq8MMjH5X3AsKyb2jS'
  );
  console.log('account data:');
  console.log(key);
})();
