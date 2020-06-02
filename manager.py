from queue import Queue

from functions import check, misc, play, playback, toggle
import spotipy


class PlaybackManager:
    def __init__(self, sp: spotipy.Spotify, queue: Queue):
        self.sp = sp
        self.playback = playback.PlaybackFunctions(sp)
        self.play = play.PlayFunctions(sp, queue)
        self.check = check.CheckFunctions(sp)
        self.toggle = toggle.ToggleFunctions(sp)
        self.misc = misc.MiscFunctions(sp)

    def pause(self):
        pass

    def resume(self):
        pass

    def toggle_playback(self):
        pass

    def skip(self):
        pass

    def previous(self):
        pass

    def toggle_shuffle(self):
        pass

    def toggle_repeat(self):
        pass

    def queue_song(self, id_):
        pass

    def play_song(self, id_):
        pass

    def play_artist(self, id_):
        pass

    def play_album(self, id_):
        pass

    def play_playlist(self, id_):
        pass

    def play_liked(self):
        pass

    def toggle_like_song(self):
        pass

    def set_volume(self, volume: int):
        pass

    def set_device(self, id_: str):
        pass

    def get_devices(self):
        pass
