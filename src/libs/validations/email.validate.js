// Validasi email
function validateEmail(email) {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email) || 'Mohon masukkan alamat email yang valid.';
}

module.exports = validateEmail;
