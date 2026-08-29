/**
 * Public Google OAuth configuration.
 *
 * The client SECRET is deliberately absent. The authorization code returned
 * to /auth/callback is sent to the backend, which performs the token exchange
 * with the secret server-side - a secret in a browser bundle is a published
 * secret.
 */
export const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;
export const OAUTH_REDIRECT_URI = import.meta.env.VITE_OAUTH_REDIRECT_URI;

export const GOOGLE_AUTH_URL =
	"https://accounts.google.com/o/oauth2/v2/auth" +
	`?client_id=${encodeURIComponent(GOOGLE_CLIENT_ID)}` +
	"&response_type=code" +
	`&scope=${encodeURIComponent("email profile")}` +
	`&redirect_uri=${encodeURIComponent(OAUTH_REDIRECT_URI)}`;
