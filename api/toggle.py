import spotipy
from api import check


class ToggleFunctions:
    def __init__(self, sp: spotipy.Spotify, player):
        self.sp = sp
        self.spotifyplayer = player
        self._check = check.CheckFunctions(sp)

    def like_song(self):
        """
        Likes the current song playing
        """
        try:
            current_song_uri = current_song = self.sp.current_user_playing_track()["item"]["uri"]
            if self._check.is_song_liked():
                self.sp.current_user_saved_tracks_delete([current_song_uri])
            else:
                self.sp.current_user_saved_tracks_add([current_song_uri])
        except:
            print("[Error] Song like could not be toggled")

    def shuffle(self):
        try:
            if self._check.is_shuffle_on():
                self.spotifyplayer.command(self.spotifyplayer.stop_shuffle())
            else:
                self.spotifyplayer.command(self.spotifyplayer.shuffle())
        except:
            print("[Error] Shuffle could not be toggled")

    def playback(self):
        try:
            if self._check.is_song_playing():
                self.spotifyplayer.command(self.spotifyplayer.pause)
            else:
                self.spotifyplayer.command(self.spotifyplayer.resume)
        except:
            print("[Error] Playback could not be toggled")

    def repeat(self, state="cycle"):
        try:
            state = state.lower()
            if state == "cycle":
                repeat_state = self._check.repeat_state()
                if repeat_state == 'track':
                    self.spotifyplayer.command(self.spotifyplayer.no_repeat)
                elif repeat_state == 'context':
                    self.spotifyplayer.command(self.spotifyplayer.repeating_track)
                else:
                    self.spotifyplayer.command(self.spotifyplayer.repeating_context)
            else:
                self.sp.repeat(state)
        except:
            print("[Error] Could not change repeat type")
