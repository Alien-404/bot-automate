const fs = require('fs').promises;
const yargs = require('yargs');
const path = require('path');
const deleteCookiesFile = require('../libs/utils/delete-cookies.util');

const configFile = path.join(__dirname, '../env/config.json');

async function setup() {
  try {
    await fs.access(configFile);
  } catch (error) {
    console.log(
      'Error: File config belum ada. Silakan jalankan "npm run setup".'
    );
    process.exit(1);
  }

  const argv = yargs
    .option('e', {
      alias: 'email',
      describe: 'Email Facebook Anda',
    })
    .option('p', {
      alias: 'password',
      describe: 'Password Facebook Anda',
    })
    .option('c', {
      alias: 'comment',
      describe: 'Teks komentar Facebook Anda',
    })
    .option('g', {
      alias: 'group_url',
      describe: 'URL grup tujuan',
    })
    .help().argv;

  const updatedConfig = require(configFile);

  if (argv.email) {
    updatedConfig.account.email = argv.email;
    await deleteCookiesFile();
  }

  if (argv.password) {
    updatedConfig.account.password = argv.password;
    await deleteCookiesFile();
  }

  if (argv.comment) {
    updatedConfig.comment = argv.comment;
  }

  if (argv.group_url) {
    updatedConfig.group_url = argv.group_url;
  }

  try {
    await fs.writeFile(configFile, JSON.stringify(updatedConfig, null, 2));
    console.log('Konfigurasi berhasil disimpan ke config.');
  } catch (error) {
    console.error(
      'Terjadi kesalahan saat menyimpan konfigurasi:',
      error.message
    );
  }
}

setup();
