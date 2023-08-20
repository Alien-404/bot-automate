const fs = require('fs').promises;
const path = require('path');

async function deleteCookiesFile() {
  const filePath = path.join(__dirname, '../../env/cookies.json');

  try {
    // Mengecek apakah file sudah ada
    const fileExists = await fs
      .access(filePath)
      .then(() => true)
      .catch(() => false);

    if (!fileExists) {
      return;
    }

    // Menghapus file
    await fs.unlink(filePath);
    console.log('session akun dihapus.');
  } catch (error) {
    console.error('Terjadi kesalahan:', error);
  }
}

module.exports = deleteCookiesFile;
