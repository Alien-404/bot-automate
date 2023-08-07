const inquirer = require('inquirer');
const { spawn } = require('child_process');
const configData = require('../config.json');
const fs = require('fs').promises;

// Validasi email
function validateEmail(email) {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email) || 'Mohon masukkan alamat email yang valid.';
}

// Validasi URL
function validateUrl(url) {
  const regex =
    /^(https?:\/\/)?(www\.)?[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*)$/;
  return regex.test(url) || 'Mohon masukkan URL yang valid.';
}

// config first
async function setup() {
  // check config first
  const configOverwritePrompt = {
    type: 'confirm',
    name: 'overwrite',
    message: 'Konfigurasi sebelumnya ada. Apakah Anda ingin meng-overwrite?',
  };

  let overwrite = false;

  if (
    Object.values(configData.account).some((value) => value !== null) ||
    configData.comment !== null ||
    configData.group_url !== null
  ) {
    const overwriteAnswer = await inquirer.prompt([configOverwritePrompt]);
    overwrite = !overwriteAnswer.overwrite;
  }

  //   exit if true
  if (overwrite) process.exit();

  const answers = await inquirer.prompt([
    {
      type: 'input',
      name: 'email',
      message: 'Masukkan email Facebook Anda:',
      validate: validateEmail,
    },
    {
      type: 'input',
      name: 'password',
      message: 'Masukkan password Facebook Anda:',
      validate: (input) => (input ? true : 'Password tidak boleh kosong.'),
    },
    {
      type: 'input',
      name: 'comment',
      message: 'Masukkan teks komentar Facebook Anda:',
      validate: (input) => (input ? true : 'Komentar tidak boleh kosong.'),
    },
    {
      type: 'input',
      name: 'group_url',
      message: 'Masukkan URL grup tujuan:',
      validate: validateUrl,
    },
  ]);

  return answers;
}

module.exports = {
  setup,
};

// run it self
if (require.main === module) {
  setup().then((answers) => {
    console.log('config:', answers);
    const configFile = './config.json';

    // restructure
    const dataConfig = {
      account: {
        email: answers.email,
        password: answers.password,
      },
      comment: answers.comment,
      group_url: answers.group_url,
    };

    fs.readFile(configFile, 'utf8')
      .then((data) => {
        const configData = JSON.parse(data);
        Object.assign(configData, dataConfig);
        return fs.writeFile(configFile, JSON.stringify(configData, null, 2));
      })
      .then(() => {
        console.log('Data berhasil diperbarui!');

        // Run the second script using child_process.spawn
        const childProcess = spawn('node', ['index']);

        // Display stdout of the child process
        childProcess.stdout.on('data', (data) => {
          console.log(`Child process output: ${data}`);
        });

        // Display stderr of the child process
        childProcess.stderr.on('data', (data) => {
          console.error(`Child process error: ${data}`);
        });

        // Handle child process exit
        childProcess.on('exit', (code) => {
          console.log(`Child process exited with code ${code}`);
        });
      })
      .catch((error) => console.error('Terjadi kesalahan:', error));
  });
}
