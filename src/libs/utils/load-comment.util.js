const path = require('path');
const fs = require('fs');

const commentedFilePath = path.join(__dirname, '../../env/commented.json');

function loadCommentedPosts() {
  try {
    fs.accessSync(commentedFilePath);
    const commentedFileData = fs.readFileSync(commentedFilePath, 'utf8');
    return new Set(JSON.parse(commentedFileData));
  } catch (error) {
    console.log('Error:', error);
    return new Set([]);
  }
}

module.exports = loadCommentedPosts;
