export const AUTH_CONSTANTS = {
  // JWT Expiration strings
  ACCESS_TOKEN_EXPIRES_IN: '15m' as const,
  REFRESH_TOKEN_EXPIRES_IN: '7d' as const,

  // Cookie MaxAge in milliseconds
  ACCESS_TOKEN_MAX_AGE_MS: 15 * 60 * 1000,
  REFRESH_TOKEN_MAX_AGE_MS: 7 * 24 * 60 * 60 * 1000,

  // Bcrypt
  BCRYPT_SALT_ROUNDS: 10,
};
