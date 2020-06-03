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
				file_contents = load(file)
		except FileNotFoundError:
			print("Cache.json does not exist.")
			print("Creating file...")
			self.create_file()

	def create_file(self):
		""" Method creates cache.json in the correct dir."""
		gen = self.generate_json()
		with open(f"{CACHE_DIR}cache.json", "w") as file:
			dump(gen, file)


	def generate_json(self):
		""" Generates the config json info """
		data_set = {"username": "", "client_id": "", "client_secret": ""}
		json_dump = dumps(data_set)
		return json_dump

	def open_json(self):
		""" Opens JSON with specific val that's passed to the property decorated methods """
		with open(f"{CACHE_DIR}cache.json") as file:
			data = file.read()
			json_obj = loads(data)
		return json_obj

	@property
	def username(self):
		js = self.open_json()
		_username = js
		return self._username

	@username.setter
	def username(self, _username):
		self._username = _username

	@property
	def client_id(self):
		return self._client_id

	@client_id.setter
	def client_id(self, _client_id):
		self._client_id = _client_id

	@property
	def client_sec(self):
		return self._client_secret

	@client_sec.setter
	def client_sec(self, _client_secret):
		self._client_secret = _client_secret


