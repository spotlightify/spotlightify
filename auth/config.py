from spotipy.oauth2 import SpotifyOAuth
from json import dump, load
from definitions import CACHE_DIR
from os import environ

scopes = [
    "streaming user-library-read",
    "user-modify-playback-state",
    "user-read-playback-state",
    "user-library-modify",
    "user-follow-read",
    "playlist-read-private",
    "playlist-read-collaborative",
    "user-follow-read",
    "playlist-modify-public",
    "playlist-modify-private"
]

class Config:
    def __init__(self):
        self._username = ""
        self._client_id = ""
        self._client_secret = ""
        self._redirect_uri = ""

        self._scope = " ".join(scopes)
        self.config_path = f"{CACHE_DIR}config.json"

        if not self.is_valid():
            self.open_json()



    def open_json(self):
        try:
            with open(self.config_path) as file:
                params = load(file)
                if all(p in params for p in ["username", "client_id", "client_secret", "redirect_uri"]):
                    self._username = params["username"]
                    self._client_id = params["client_id"]
                    self._client_secret = params["client_secret"]
                    self._redirect_uri = params["redirect_uri"]

        except FileNotFoundError:
            print("config.json does not exist.")

    def save_json(self):
        data = {
            "username": self._username,
            "client_id": self._client_id,
            "client_secret": self._client_secret,
            "redirect_uri": self._redirect_uri
        }

        with open(self.config_path, "w") as file:
            dump(data, file, separators=(',', ':'))

    def get_oauth(self):
        return SpotifyOAuth(
            client_id=self._client_id,
            client_secret=self._client_secret,
            username=self._username,
            redirect_uri=self._redirect_uri,
            scope=self._scope
        )

    def is_valid(self):
        if len(self.username) == 0:
            return False
        if len(self.client_id) != 32:
            return False
        if len(self._client_secret) != 32:
            return False
        if len(self._redirect_uri) == 0:
            return False

        return True

    @property
    def username(self):
        return self._username

    @username.setter
    def username(self, value):
        self._username = value
        self.save_json()

    @property
    def client_id(self):
        return self._client_id

    @client_id.setter
    def client_id(self, value):
        self._client_id = value
        self.save_json()

    @property
    def client_secret(self):
        return self._client_secret

    @client_secret.setter
    def client_secret(self, value):
        self._client_secret = value
        self.save_json()

    @property
    def redirect_uri(self):
        return self._redirect_uri

    @redirect_uri.setter
    def redirect_uri(self, value):
        self._redirect_uri = value
        self.save_json()

    def set_all(self, username, client_id, client_secret, redirect_uri):
        self._username = username
        self._client_id = client_id
        self._client_secret = client_secret
        self._redirect_uri = redirect_uri
        self.save_json()


config = Config()
