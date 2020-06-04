# remove _ from filename before use, and the _config.json folder in user_info dir.
from json import dump, dumps, load, loads
from definitions import CACHE_DIR


class Config:

	def __init__(self, username, client_id, client_secret):
		self._username = username
		self._client_id = client_id,
		self._client_secret = client_secret

		try:
			with open(f"{CACHE_DIR}config.json") as file:
				self.open_json()
		except FileNotFoundError:
			print("Cache.json does not exist.")
			print("Creating file...")
			self.create_file()

	def create_file(self):
		""" Generates the json in the correct dir."""
		data_set = {"username": "value", "client_id": "value", "client_secret": "value"}
		with open(f"{CACHE_DIR}config.json", "w", encoding='utf-8') as file:
			dump(data_set, file, ensure_ascii=False, indent=4)

	def open_json(self):
		""" Opens JSON with specific val that's passed to the property decorated methods """
		with open(f"{CACHE_DIR}config.json") as file:
			json_obj = load(file)
		return json_obj

	def save_json(self, username, client_id, client_secret ):
		""" Method creates config.json in the correct dir"""
		data = {
			"username": f"{username}",
			"client_id": f"{client_id}",
			"client_secret": f"{client_secret}"
		}

		with open(f"{CACHE_DIR}config.json", "w") as file:
			dump(data, file)
			print("Config updated")

	@property
	def username(self):
		js = self.open_json()
		self._username = js['username']
		return self._username

	@username.setter
	def username(self, val):
		self._username = val

	@property
	def client_id(self):
		js = self.open_json()
		self._client_id = js['client_id']
		return self._client_id

	@client_id.setter
	def client_id(self, val):
		self._client_id = val

	@property
	def client_sec(self):
		js = self.open_json()
		self._client_secret = js['client_secret']
		return self._client_secret

	@client_sec.setter
	def client_sec(self, _client_secret):
		self._client_secret = _client_secret