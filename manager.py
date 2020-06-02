from queue import Queue

from functions import misc, play, playback, toggle, check
import spotipy


class PlaybackManager:
    def __init__(self, sp: spotipy.Spotify, queue: Queue):
        self.sp = sp
        self.playback = playback.PlaybackFunctions(sp)
        self.play = play.PlayFunctions(sp, queue)
        self.toggle = toggle.ToggleFunctions(sp)
        self.check = check.CheckFunctions(sp)
        self.misc = misc.MiscFunctions(sp)

    def pause(self):
        self.toggle.playback(state=False)

    def resume(self):
        self.toggle.playback(state=True)

    def toggle_playback(self):
        self.toggle.playback()

    def skip(self):
        self.playback.skip()

    def previous(self):
        self.playback.previous()

    def toggle_shuffle(self):
        self.toggle.shuffle()

    def toggle_repeat(self):
        self.toggle.repeat()

    def queue_song(self, id_: str):
        """
        Queue's a song given an id/uri/term
        :param id_: id/uri/term for song
        """
        format_ = self.check.song_link_type(id_, "song")
        if format_ == "id":
            self.play.queue_id(id_)
        elif format_ == "uri":
            self.play.queue_uri(id_)
        else:
            self.play.queue_term(id_)

    def play_song(self, id_):
        """
        Play's a song given an id/uri/term
        :param id_: id/uri/term for song
        """
        format_ = self.check.song_link_type(id_, "song")
        if format_ == "id":
            self.play.id(id_, "song")
        elif format_ == "uri":
            self.play.uri(id_)
        else:
            self.play.term(id_)

    def play_artist(self, id_):
        self.__play(id_, "artist")

    def play_album(self, id_):
        self.__play(id_, "album")

    def play_playlist(self, id_):
        self.__play(id_, "playlist")

    def __play(self, id_: str, item_type: str):
        format_ = self.check.song_link_type(id_, item_type)
        if format_ == "uri":
            self.play.uri(id_)
        else:
            self.play.id(id_, item_type)

    def play_liked(self):
        self.play.liked_songs()

    def toggle_like_song(self):
        self.toggle.like_song()

    def set_volume(self, volume: int):
        if 0 <= volume <= 10:
            volume *= 10
            self.misc.set_volume(volume)
        else:
            print("[Error] Invalid Volume Range. Must be an int of range 1 - 10 ")

    def set_device(self, id_: str):
        """
        Sets the device for playback
        :param id_: id of device, if id_= "" default device will be selected
        :return: None
        """
        if id_ == "":
            self.misc.set_default_device()
        else:
            self.misc.set_device(id_)

    def get_devices(self) -> list:  # Will probably not be needed here after command class has been broken up
        return self.misc.get_device_list()
