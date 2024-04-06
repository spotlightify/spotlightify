import { AccessToken, SpotifyApi } from '@spotify/web-api-ts-sdk';

const accessToken: AccessToken = {
  access_token:
    'BQCgouGHPG-NngU-htWG3vrjPEbbXYnd8eBDWjeazFoUM7DFT26Rzqb1-UHCyTwy1IP5wNWhcinmO867SXYcuahDL5QXvle8jqaZLM7m3g1TL2nEXh9o17yBP8STqlOEL1nY3qK7PDRIEGbfZs0CkWA2Jd4Bb-iocQypbRnB7LZNx0tkgSSo3UK-7f7vCDAESggQx6gHH1Ou4GnQltezUEKG40VOc9OgRTNznl_8FdadCyly-royT7nR2XAfGvcrvMRK5wgxnWWk5AaZFzkFGjZ4x3FJe7B5sc5ptAyxJu3kIk6eyNf8',
  token_type: 'Bearer',
  expires_in: 3600,
  refresh_token: '',
};

// Create a Spotify instance
const spotifyApi = SpotifyApi.withAccessToken(
  'd62cd165329a42bc9b35c4683ca8df3e',
  accessToken,
);

export default spotifyApi;
