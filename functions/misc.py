import spotipy


class MiscFunctions:
    def __init__(self, sp: spotipy.Spotify):
        self.sp = sp

    def get_device_list(self):
        pass

    def set_device(self, id_: str):
        pass

    def set_volume(self, value: int):
        pass

    def refresh_token(self):
        pass
