import spotipy
from spotlight.manager import check
#from spotlight._interactions import Interactions


class ToggleFunctions:
    def __init__(self, sp: spotipy.Spotify):
        self.sp = sp
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
                self.sp.shuffle(False)
                #Interactions.command_list["Shuffle"]["description"] = "Shuffle is (OFF). Click to change to (ON)"
            else:
                self.sp.shuffle(True)
                #Interactions.command_list["Shuffle"]["description"] = "Shuffle is (ON). Click to change to (OFF)"
        except:
            print("[Error] Shuffle could not be toggled")

    def playback(self):
        try:
            if self._check.is_song_playing():
                self.sp.pause_playback()
            else:
                self.sp.start_playback()
        except:
            print("[Error] Playback could not be toggled")

    def repeat(self):
        try:
            repeat_state = self._check.repeat_state()
            if repeat_state == 'track':
                self.sp.repeat('off')
            elif repeat_state == 'context':
                self.sp.repeat('track')
            else:
                self.sp.repeat('context')
        except:
            print("[Error] Could not toggle repeat type")
