// Validasi URL
function validateUrl(url) {
  const regex =
    /^(https?:\/\/)?(www\.)?[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*)$/;
  return regex.test(url) || 'Mohon masukkan URL yang valid.';
}

module.exports = validateUrl;