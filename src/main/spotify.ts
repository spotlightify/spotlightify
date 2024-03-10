/* eslint-disable camelcase */
import express, { Request, Response } from 'express';
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

const app: express.Application = express();
const port: number = 51234;
const clientId: string = 'd62cd165329a42bc9b35c4683ca8df3e';
const redirectUri: string = `http://localhost:${port}/callback`;
const authorizationEndpoint = 'https://accounts.spotify.com/authorize';
const tokenEndpoint = 'https://accounts.spotify.com/api/token';
let code_verifier: string;

app.get('/login', (req: Request, res: Response) => {
  const state = 'spotlightify-state';
  const scope = scopes.join(' ');

  res.redirect(
    `https://accounts.spotify.com/authorize?${stringify({
      response_type: 'code',
      client_id: clientId,
      scope,
      redirect_uri: redirectUri,
      state,
    })}`,
  );
});

async function getToken(code: string) {
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
  const randomValues = crypto.getRandomValues(new Uint8Array(64));
  const randomString = randomValues.reduce(
    (acc, x) => acc + possible[x % possible.length],
    '',
  );

  const codeVerifier = randomString;
  const data = new TextEncoder().encode(codeVerifier);
  const hashed = await crypto.subtle.digest('SHA-256', data);

  const codeChallengeBase64 = btoa(
    String.fromCharCode(...new Uint8Array(hashed)),
  )
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');

  code_verifier = codeVerifier;

  const authUrl = new URL(authorizationEndpoint);
  const params = {
    response_type: 'code',
    client_id: clientId,
    scope: scopes.join(' '),
    code_challenge_method: 'S256',
    code_challenge: codeChallengeBase64,
    redirect_uri: redirectUri,
  };

  authUrl.search = new URLSearchParams(params).toString();
  res.redirect(authUrl.toString()); // Redirect the user to the authorization server for login
});

app.get('/callback', async (req, res) => {
  const { code } = req.query;

  try {
    const token = await getToken(code as string);
    if (token.error) {
      throw token.error;
    }

    res.send(
      '<h1>Auth complete!</h1><p>You can now close this browser tab and return to Spotlightify.</p>',
    );
  } catch (error) {
    res.send(
      `<h1>Auth failed!</h1><p>Something went wrong. Please try again. See Error: </p><p>${error}</p>`,
    );
  }
});

app.listen(port);
