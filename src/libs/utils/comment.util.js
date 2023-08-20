const fs = require('fs').promises;
const path = require('path');

async function writeCommentedPosts(comment) {
  const filePath = path.join(__dirname, '../../env/commented.json');

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

    // Menambahkan komentar baru atau mengganti seluruh konten
    const newComment = { comment };
    const newData = [...existingData, newComment];
    await fs.writeFile(filePath, JSON.stringify(newData, null, 2), 'utf8');

    console.log('data history telah ditulis ke commented.json');
  } catch (error) {
    console.error('Terjadi kesalahan:', error);
  }
}

module.exports = writeCommentedPosts;
