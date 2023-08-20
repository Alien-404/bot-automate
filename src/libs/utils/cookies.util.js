const fs = require('fs').promises;
const path = require('path');

async function loadCookiesFromFile() {
  const filePath = path.join(__dirname, '../../env/cookies.json');

  try {
    // Mengecek apakah file sudah ada
    const fileExists = await fs
      .access(filePath)
      .then(() => true)
      .catch(() => false);

    if (!fileExists) {
      console.log('File cookies tidak ditemukan.');
      return null; // Mengembalikan nilai null jika file tidak ditemukan
    }

    const cookiesContent = require(filePath);
    return JSON.parse(cookiesContent);
  } catch (error) {
    console.error('Terjadi kesalahan:', error);
    return null;
  }
}

module.exports = loadCookiesFromFile;
