class User {
  constructor(
    {
      id,
      username,
      email,
      passwordHash,
      password_hash,
      createdAt,
      created_at,
      isVerified,
      is_verified,
      verificationToken,
      verification_token,
      verificationTokenExpires,
      verification_token_expires,
      malId,
      mal_id,
      malUsername,
      mal_username,
      malAccessToken,
      mal_access_token,
      malRefreshToken,
      mal_refresh_token,
      malTokenExpires,
      mal_token_expires,
    }) {
    this.id = id;
    this.username = username;
    this.email = email;
    this.passwordHash = passwordHash || password_hash;
    this.createdAt = createdAt || created_at;
    this.isVerified = isVerified !== undefined ? isVerified : (is_verified !== undefined ? is_verified : false);
    this.verificationToken = verificationToken || verification_token || null;
    this.verificationTokenExpires = verificationTokenExpires || verification_token_expires || null;
    this.malId = malId || mal_id || null;
    this.malUsername = malUsername || mal_username || null;
    this.malAccessToken = malAccessToken || mal_access_token || null;
    this.malRefreshToken = malRefreshToken || mal_refresh_token || null;
    this.malTokenExpires = malTokenExpires || mal_token_expires || null;
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
