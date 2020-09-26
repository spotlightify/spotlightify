from spotipy import Spotify


class SpotifySingleton:
    __instance__ = None

    def __init__(self, access_token: str):
        if SpotifySingleton.__instance__ is None:
            SpotifySingleton.__instance__ = Spotify(access_token)
        else:
            raise Exception("You cannot create another SpotifySingleton class")

    @staticmethod
    def get_instance():
        """ Static method to fetch the current instance.
        """
        if SpotifySingleton.__instance__ != None:
            return SpotifySingleton.__instance__
        else:
            raise Exception("SpotifySingleton instance must first be created")

