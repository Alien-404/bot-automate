function validateArguments(type, key) {
  if (!type || !key) {
    console.error(
      'Error: Type dan key harus diisi. Contoh: npm start [public/private] [Kode akses]'
    );
    process.exit(1);
  }

  if (!['public', 'private'].includes(type)) {
    console.error('Error: Type harus antara "public" atau "private".');
    process.exit(1);
  }

  if (isNaN(key) || key.trim() === '') {
    console.error('Error: Kode akses harus berupa angka yang valid.');
    process.exit(1);
  }

  if (type === 'public') {
    return 2;
  } else if (type === 'private') {
    return 8;
  }
}

module.exports = validateArguments;
