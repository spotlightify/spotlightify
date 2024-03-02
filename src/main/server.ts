import { AccessToken } from '@spotify/web-api-ts-sdk';
import express from 'express';
// const bodyParser = require('body-parser');

const app = express();
const port = 8080;

// app.use(bodyParser.json());
// app.use(bodyParser.urlencoded({ extended: false }));

app.post('/accept-user-token', (req, res) => {
  try {
    const data: AccessToken = req.body as AccessToken;
    console.log(data);
    res.send('Authentication successful! You can now close this window.');
  } catch (e: any) {
    res.send(
      `Error occurred while authenticating user, please try again. \nError: ${e.message}`,
    );
  }
});

app.listen(port);
