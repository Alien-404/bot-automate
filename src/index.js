const { spawn } = require('child_process');
const axios = require('axios');
const bcrypt = require('bcrypt');
const fs = require('fs');
const path = require('path');
const validateArguments = require('./libs/validations/argv.validate');

// config
const key = process.argv[3];
const type = process.argv[2];

// validate
const childNumber = validateArguments(type, key);

// auto run
(async () => {
  const configFile = path.join(__dirname, 'env/config.json');

  if (!fs.existsSync(configFile)) {
    console.log(
      'Error: config.json file is missing. Please run "npm setup" first.'
    );
    process.exit(1);
  }

  // config file
  const configAccount = require(path.join(__dirname, '/env/config.json'));
  const mainBot = require('./app');
  const { account, comment, group_url } = configAccount;

  if (
    Object.values(account).some((value) => value == null) ||
    comment == null ||
    group_url == null
  ) {
    console.log('Please set up the account');
    spawn('node', ['config/config.js'], { stdio: 'inherit' });
  } else {
    try {
      const response = await axios.get(
        'https://api-key-bot.vercel.app/api/key'
      );
      const isValid = await bcrypt.compare(key, response.data.key);

      if (!isValid) {
        throw new Error('Invalid access code!');
      }

      mainBot(childNumber);
    } catch (error) {
      console.log('Error:', error.message);
    }
  }
})();
