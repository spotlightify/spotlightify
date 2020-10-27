from api.manager import PlaybackManager
from spotlight.suggestions.options import OptionSuggestion


class AlbumSuggestion(OptionSuggestion):
    def __init__(self, name: str, artists: str, image_name: str, id_: str):
        """
        Album Suggestion Class
        :param name: Name of the album
        :param artists: artists associated with album
        :param image_name: This is the ALBUM ID, use "" if the song is not cached
        :param id_: id/uri for album
        """
        OptionSuggestion.__init__(self, name, f"By {artists}", image_name if len(image_name) == 22 else "album",
                                  PlaybackManager.play_album, "", id_, "exe")


# TODO Add options for this class
