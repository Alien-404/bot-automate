const fs = require('fs').promises;
const path = require('path');

(async () => {
  const configFile = path.join(__dirname, '../env/config.json');

  try {
    await fs.access(configFile);
  } catch (error) {
    console.log(
      'Error: File config belum ada. Silakan jalankan "npm run setup".'
    );
    process.exit(1);
  }

  const configData = require(configFile);

  console.log('account data:');
  console.log(configData);
})();
