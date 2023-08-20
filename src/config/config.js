const inquirer = require('inquirer');
const fs = require('fs').promises;
const path = require('path');

const validateEmail = require('../libs/validations/email.validate');
const validateUrl = require('../libs/validations/url.validate');
const deleteCookiesFile = require('../libs/utils/delete-cookies.util');

async function setup() {
  const configFile = path.join(__dirname, '../env/config.json');

  let configData = {};

  try {
    await fs.access(configFile);
    console.log('config.json already exists.');
    configData = require(configFile);

    if (
      Object.values(configData.account).some((value) => value !== null) ||
      configData.comment !== null ||
      configData.group_url !== null
    ) {
      const configOverwritePrompt = {
        type: 'confirm',
        name: 'overwrite',
        message:
          'Konfigurasi sebelumnya ada. Apakah Anda ingin meng-overwrite?',
      };

      const { overwrite } = await inquirer.prompt([configOverwritePrompt]);
      if (!overwrite) process.exit();
    }
  } catch (error) {
    // config.json doesn't exist, create it
    console.log('config.json does not exist. Creating...');
  }

  const questions = [
    {
      type: 'input',
      name: 'email',
      message: 'Masukkan email Facebook Anda:',
      validate: validateEmail,
      when: process.stdin.isTTY,
    },
    {
      type: 'input',
      name: 'password',
      message: 'Masukkan password Facebook Anda:',
      validate: (input) => (input ? true : 'Password tidak boleh kosong.'),
      when: process.stdin.isTTY,
    },
    {
      type: 'input',
      name: 'comment',
      message: 'Masukkan teks komentar Facebook Anda:',
      validate: (input) => (input ? true : 'Komentar tidak boleh kosong.'),
      when: process.stdin.isTTY,
    },
    {
      type: 'input',
      name: 'group_url',
      message: 'Masukkan URL grup tujuan:',
      validate: validateUrl,
      when: process.stdin.isTTY,
    },
  ];

  const answers = await inquirer.prompt(questions);

  const dataConfig = {
    account: {
      email: answers.email,
      password: answers.password,
    },
    comment: answers.comment,
    group_url: answers.group_url,
  };

  try {
    Object.assign(configData, dataConfig);
    await fs.writeFile(configFile, JSON.stringify(configData, null, 2));
    await deleteCookiesFile();
    console.log('Data berhasil diperbarui, silahkan jalankan kembali bot nya.');
  } catch (error) {
    console.error('Terjadi kesalahan:', error);
  }
}

module.exports = {
  setup,
};

if (require.main === module) {
  setup();
}
