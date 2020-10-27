from api.manager import PlaybackManager
from spotlight.suggestions.options import OptionSuggestion


class PlaylistSuggestion(OptionSuggestion):
    def __init__(self, name: str, owner: str, image_name: str, id_: str):
        """
        Playlist Suggestion Class
        :param name: Name of the playlist
        :param owner: owner associated with the playlist
        :param image_name: This is the PLAYLIST ID of a playlist, use "" if the song is not cached
        :param id_: id/uri for playlist
        """
        OptionSuggestion.__init__(self, name, f"By {owner}", image_name if len(image_name) == 22 else "playlist",
                                  PlaybackManager.play_playlist, "", id_, "exe")



# TODO Add options for this class
