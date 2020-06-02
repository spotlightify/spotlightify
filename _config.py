from definitions import CACHE_DIR


class Config:

	def __init__(self ):
		self.username = None,
		self.client_id = None,
		self.client_secret = None

		try:
			with open(f"{CACHE_DIR}cache.json") as file:
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
			print(f"{gen} file was created")


	def generate_json(self):
		""" Generates the config json info """
		data_set = {"username": "", "client_id": "", "client_secret": ""}
		json_dump = dumps(data_set)
		print(json_dump)

	def open_json(self):
		with open(f"{CACHE_DIR}cache.json") as f:
			_f = load(f)
		return _f
