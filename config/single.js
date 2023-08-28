const fs = require('fs').promises;
const yargs = require('yargs');
const configFile = require('../config.json');

async function setup() {
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

  // change
  if (argv.email) {
    configFile.account.email = (argv.email).toString();
  }

  if (argv.password) {
    configFile.account.password = argv.password;
  }

  if (argv.comment) {
    configFile.comment = argv.comment;
  }

  if (argv.group_url) {
    configFile.group_url = argv.group_url;
  }

  try {
    await fs.writeFile('./config.json', JSON.stringify(configFile, null, 2));
    console.log('Konfigurasi berhasil disimpan ke configFile.');
  } catch (error) {
    console.error(
      'Terjadi kesalahan saat menyimpan konfigurasi:',
      error.message
    );
  }
}

setup();
