function validateLogin(email, password) {
  if (!email || !password) {
    return false;
  }

  if (email === "test@gmail.com" && password === "123456") {
    return true;
  }

  return false;
}

module.exports = validateLogin;