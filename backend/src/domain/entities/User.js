class User {
  constructor({ id, username, email, passwordHash, createdAt }) {
    this.id = id;
    this.username = username;
    this.email = email;
    this.passwordHash = passwordHash;
    this.createdAt = createdAt;
  }

  // Domain logic methods
  isValidEmail() {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(this.email);
  }

  isValidUsername() {
    return this.username && this.username.length >= 3 && this.username.length <= 30;
  }
}

module.exports = User;
