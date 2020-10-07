from api.manager import PlaybackManager
from spotlight.suggestions.options import OptionSuggestion


class ArtistSuggestion(OptionSuggestion):
    def __init__(self, name: str, genre: str, image_name: str, id_: str):
        """
        Artist Suggestion Class
        :param name: Name of the artist
        :param genre: artists main genre
        :param image_name: This is the ARTIST ID, use "" if the song is not cached
        :param id_: id/uri for artist
        """
        OptionSuggestion.__init__(self, name, genre, image_name if len(image_name) == 22 else "artist",
                                  PlaybackManager.play_artist, "", id_, "exe")



# TODO Add options for this class
