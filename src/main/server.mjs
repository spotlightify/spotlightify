import express from 'express';
import { stringify } from 'querystring';
import fetch from 'node-fetch';
import * as crypto from 'crypto';

const scopes = [
  'streaming user-library-read',
  'user-modify-playback-state',
  'user-read-playback-state',
  'user-library-modify',
  'user-follow-read',
  'playlist-read-private',
  'playlist-read-collaborative',
  'user-follow-read',
  'playlist-modify-public',
  'playlist-modify-private',
];
const app = express();
const port = 5000;
const clientId = 'd62cd165329a42bc9b35c4683ca8df3e';
const redirectUri = `http://localhost:${port}/callback`;
const authorizationEndpoint = 'https://accounts.spotify.com/authorize';
const tokenEndpoint = 'https://accounts.spotify.com/api/token';
let code_verifier;

async function getToken(code) {
  const response = await fetch(tokenEndpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      client_id: clientId,
      grant_type: 'authorization_code',
      code,
      redirect_uri: redirectUri,
      code_verifier,
    }),
  });
  return response.json();
}

app.get('/auth', async function redirectToSpotifyAuthorize(req, res) {
  const possible =
    'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let randomString = '';
  const randomBytes = crypto.randomBytes(64);
  for (let i = 0; i < randomBytes.length; ++i) {
    randomString += possible.charAt(randomBytes[i] % possible.length);
  }
  const codeVerifier = randomString;
  // Use Node.js crypto to create the hash
  const hash = crypto
    .createHash('sha256')
    .update(codeVerifier)
    .digest('base64');
  const codeChallenge = hash
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');

  code_verifier = codeVerifier; // Make sure this value is accessible for the token exchange
  const authUrl = new URL(authorizationEndpoint);
  const params = {
    response_type: 'code',
    client_id: clientId,
    scope: scopes.join(' '),
    code_challenge_method: 'S256',
    code_challenge: codeChallenge,
    redirect_uri: redirectUri,
  };
  authUrl.search = new URLSearchParams(params).toString();
  res.redirect(authUrl.toString()); // Redirect the user to the authorization server for login
});

app.get('/callback', async (req, res) => {
  const { code } = req.query;
  try {
    const token = await getToken(code);
    if (token.error) {
      throw token.error;
    }
    console.log(token);
    res.send(
      '<h1>Auth complete!</h1><p>You can now close this browser tab and return to Spotlightify.</p>',
    );
  } catch (error) {
    res.send(
      `<h1>Auth failed!</h1><p>Something went wrong. Please try again. See Error: </p><p>${error}</p>`,
    );
  }
});
app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
