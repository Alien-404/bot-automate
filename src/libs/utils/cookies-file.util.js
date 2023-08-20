const fs = require('fs').promises;
const path = require('path');

async function writeDataToFile(data) {
  const filePath = path.join(__dirname, '../../env/cookies.json');

  try {
    // Mengecek apakah file sudah ada
    const fileExists = await fs
      .access(filePath)
      .then(() => true)
      .catch(() => false);

    if (!fileExists) {
      // Jika file belum ada, buat direktori
      const dirPath = path.dirname(filePath);
      await fs.mkdir(dirPath, { recursive: true });
    }

    let existingData = [];
    if (fileExists) {
      // Jika file sudah ada, baca datanya
      const existingContent = await fs.readFile(filePath, 'utf8');
      existingData = JSON.parse(existingContent);
    }

    // Menambahkan data baru atau mengganti seluruh konten
    await fs.writeFile(filePath, JSON.stringify(data), 'utf8');

    console.log(`session data telah ditulis ke cookie`);
  } catch (error) {
    console.error('Terjadi kesalahan:', error);
  }
}

module.exports = writeDataToFile;
