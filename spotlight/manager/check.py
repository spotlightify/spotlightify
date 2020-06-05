import spotipy


class CheckFunctions:
    def __init__(self, sp: spotipy.Spotify):
        self.sp = sp

    def is_song_playing(self) -> bool:
        try:
            return self.sp.current_playback()["is_playing"]
        except:
            return False

    def is_shuffle_on(self) -> bool:
        try:
            return self.sp.current_playback()["shuffle_state"]
        except:
            return False

    def is_song_liked(self) -> bool:
        try:
            current_song = self.sp.currently_playing()["item"]
            if self.sp.current_user_saved_tracks_contains([current_song["id"]])[0]:
                return True
            else:
                return False
        except:
            return False

    def item_link_type(self, id_: str, item_type: str) -> str:
        '''
        Used to determine if an item (song, album, playlist or artist) link (identifier) is of type uri, id or term
        :param id_: the identifier of link uri/id/term
        :param item_type: the item type of song, album, playlist or artist
        :return:
        '''
        if item_type == "song":
            if "spotify:song:" in id_:
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

