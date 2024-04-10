"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
/* eslint-disable camelcase */
const express_1 = __importDefault(require("express"));
const querystring_1 = require("querystring");
const node_fetch_1 = __importDefault(require("node-fetch"));
const crypto = __importStar(require("crypto"));
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
const app = (0, express_1.default)();
const port = 51234;
const clientId = 'd62cd165329a42bc9b35c4683ca8df3e';
const redirectUri = `http://localhost:${port}/callback`;
const authorizationEndpoint = 'https://accounts.spotify.com/authorize';
const tokenEndpoint = 'https://accounts.spotify.com/api/token';
let code_verifier;
app.get('/login', (req, res) => {
    const state = 'spotlightify-state';
    const scope = scopes.join(' ');
    res.redirect(`https://accounts.spotify.com/authorize?${(0, querystring_1.stringify)({
        response_type: 'code',
        client_id: clientId,
        scope,
        redirect_uri: redirectUri,
        state,
    })}`);
});
async function getToken(code) {
    const response = await (0, node_fetch_1.default)(tokenEndpoint, {
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
    const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const randomValues = crypto.getRandomValues(new Uint8Array(64));
    const randomString = randomValues.reduce((acc, x) => acc + possible[x % possible.length], '');
    const codeVerifier = randomString;
    const data = new TextEncoder().encode(codeVerifier);
    const hashed = await crypto.subtle.digest('SHA-256', data);
    const codeChallengeBase64 = btoa(String.fromCharCode(...new Uint8Array(hashed)))
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
        const token = await getToken(code);
        if (token.error) {
            throw token.error;
        }
        res.send('<h1>Auth complete!</h1><p>You can now close this browser tab and return to Spotlightify.</p>');
    }
    catch (error) {
        res.send(`<h1>Auth failed!</h1><p>Something went wrong. Please try again. See Error: </p><p>${error}</p>`);
    }
});
app.listen(port);
