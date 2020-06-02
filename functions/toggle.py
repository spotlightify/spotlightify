import spotipy
from functions import check


class ToggleFunctions:
    def __init__(self, sp: spotipy.Spotify):
        self.sp = sp
        self.check = check.CheckFunctions(sp)

    def like_song(self):
        """
        Likes the current song playing
        """
        try:
            current_song = current_song = self.sp.current_user_playing_track()["item"]
            if self.check.is_song_liked():
                self.sp.current_user_saved_tracks_delete([current_song["uri"]])
            else:
                self.sp.current_user_saved_tracks_add([current_song["uri"]])
        except:
            print("[Error] Song like could not be toggled")

    def shuffle(self) -> str:  # return description string for command
        try:
            if self.check.is_shuffle_on():
                self.sp.shuffle(False)
            else:
                self.sp.shuffle(True)
        except:
            print("[Error] Shuffle could not be toggled")

    def shuffle_with_str(self) -> str:  # return description string for command
        try:
            if self.check.is_shuffle_on():
                self.sp.shuffle(False)
                return "Shuffle is currently OFF. Click to turn ON."
            else:
                self.sp.shuffle(True)
                return "Shuffle is currently ON. Click to turn OFF."
        except:
            print("[Error] Shuffle could not be toggled")

    def playback_with_str(self):
        try:
            if self.check.is_song_playing():
                self.sp.pause_playback()
                return "Shuffle is currently OFF. Click to turn ON."
            else:
                self.sp.start_playback()
                return "Shuffle is currently ON. Click to turn OFF."
        except:
            print("[Error] Playback could not be toggled")
            return False

    def playback(self):
        try:
            if self.check.is_song_playing():
                self.sp.pause_playback()
            else:
                self.sp.start_playback()
        except:
            print("[Error] Playback could not be toggled")

    def repeat(self):  # return description string for command
        try:
            if self.is_repeat_track():
                self.sp.repeat('off', self.current_device_id)
                self.command_list["Repeat"]["title"] = "Repeat (ALL)"
            elif self.is_repeat_context():
                self.sp.repeat('track', self.current_device_id)
                self.command_list["Repeat"]["title"] = "Repeat (OFF)"
            else:
                self.sp.repeat('context', self.current_device_id)
                self.command_list["Repeat"]["title"] = "Repeat (TRACK)"
        except:
            print("[Error] Could not toggle repeat type")

    def _is_repeat_context(self) -> bool:  # potentially put inside repeat method
        try:
            if self.sp.current_playback()['repeat_state'] == 'context':
                return True
            else:
                return False
        except:
            return False

    def _is_repeat_track(self) -> bool:  # potentially put inside repeat method
        try:
            if self.sp.current_playback()['repeat_state'] == 'track':
                return True
            else:
                return False
        except:
            return False
