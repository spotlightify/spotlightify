import spotipy
from api.limiter import Limiter


class CheckFunctions:
    def __init__(self, sp: spotipy.Spotify):
        self.sp = sp

    def is_song_playing(self) -> bool:
        try:
            return self.sp.current_playback()["is_playing"]
        except:
            return False

    @Limiter.rate_limiter(seconds=2)
    def is_shuffle_on(self) -> bool:
        try:
            return self.sp.current_playback()["shuffle_state"]
        except:
            return False

    @Limiter.rate_limiter(seconds=5)
    def is_song_liked(self) -> bool:
        try:
            current_song = self.sp.currently_playing()["item"]
            if self.sp.current_user_saved_tracks_contains([current_song["id"]])[0]:
                return True
            else:
                return False
        except:
            return False

    @Limiter.rate_limiter(seconds=2)
    def repeat_state(self) -> str:
        """Returns a string describing the current state of repeat

        Returns:
            str: Can either be '' (No music playing) 'off', 'context' or 'all'
        """
        try:
            return self.sp.current_playback()['repeat_state']
        except:
            return ''

    def item_link_type(self, id_: str, item_type: str) -> str:
        '''
        Used to determine if an item (song, album, playlist or artist) link (identifier) is of type uri, id or term
        :param id_: the identifier of link uri/id/term
        :param item_type: the item type of song, album, playlist or artist
        :return:
        '''
        if item_type == "song":
            if "spotify:track:" in id_:
                return "uri"
            elif len(id_) == 22 and " " not in id_:
                return "id"
            else:
                return "term"
        else:
            if f"spotify:{item_type.lower().strip()}:" in id_:
                return "uri"
            else:
                return "id"

