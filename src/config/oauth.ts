export const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
export const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
export const OAUTH_REDIRECT_URI = process.env.OAUTH_REDIRECT_URI;

export const GOOGLE_AUTH_URL = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${GOOGLE_CLIENT_ID}&response_type=code&scope=email%20profile&redirect_uri=${OAUTH_REDIRECT_URI}`; 