from os import kill, getpid, environ
from queue import Queue

import clipboard
import spotipy

from api import misc, play, playback, toggle, check


class PlaybackManager:
    def __init__(self, sp: spotipy.Spotify, queue: Queue):
        self.sp = sp
        self._playback = playback.PlaybackFunctions(sp)
        self._play = play.PlayFunctions(sp, queue)
        self._toggle = toggle.ToggleFunctions(sp)
        self._check = check.CheckFunctions(sp)
        self._misc = misc.MiscFunctions(sp)

    def pause(self):
        self._playback.pause()

    def resume(self):
        self._playback.resume()

    def toggle_playback(self):
        self._toggle.playback()

    def skip(self):
        self._playback.skip()

    def previous(self):
        self._playback.previous()

    def goto(self, time: str):
        self._playback.goto(time)

    def toggle_shuffle(self):
        self._toggle.shuffle()

    def toggle_repeat(self, state="cycle"):
        self._toggle.repeat(state)

    def queue_song(self, id_: str):
        """
        Queues a song given an id/uri/term
        :param id_: id/uri/term for song
        """
        format_ = self._check.item_link_type(id_, "song")
        if format_ == "id":
            self._play.queue_id(id_)
        elif format_ == "uri":
            self._play.queue_uri(id_)
        else:
            self._play.queue_term(id_)

    def play_recommended(self, id_):
        """
        Plays recommended songs based on a songs ID
        :param id_:
        :return:
        """
        self._play.song_recommendations(id_)

    def play_song(self, id_):
        """
        Plays a song given an id/uri/term
        :param id_: id/uri/term for song
        """
        format_ = self._check.item_link_type(id_, "song")
        if format_ == "id":
            self._play.id(id_, "track")
        elif format_ == "uri":
            self._play.uri(id_)
        else:
            self._play.term(id_)

    def play_artist(self, id_):
        self.__play(id_, "artist")

    def play_album(self, id_):
        self.__play(id_, "album")

    def play_playlist(self, id_):
        self.__play(id_, "playlist")

    def __play(self, id_: str, item_type: str):
        '''

        :param id_: uri/id/term
        :param item_type: the format of song, either uri, id or term
        :return:
        '''
        format_ = self._check.item_link_type(id_, item_type)
        if format_ == "uri":
            self._play.uri(id_)
        else:
            self._play.id(id_, item_type)

    def play_liked(self):
        self._play.liked_songs()

    def toggle_like_song(self):
        self._toggle.like_song()

    def set_volume(self, volume: str):
        try:
            volume = int(volume)
            self._misc.set_volume(volume)
        except:
            print("[Error] Volume must be a valid number between 1 and 10.")

    def set_device(self, id_: str):
        """
        Sets the device for playback
        :param id_: id of device, if id_= "" default device will be selected
        :return: None
        """
        if id_ == "":
            self._misc.set_default_device()
        else:
            self._misc.set_device(id_)

    def get_devices(self) -> list:  # Will probably not be needed here after command class has been broken up
        return self._misc.get_device_list()

    def current_song(self) -> dict:
        return self._playback.get_current_song_info()

    def copy_url_to_clipboard(self, id_=""):
        """

        :param id_: if not current song, use this variable for a songs id
        :return:
        """
        if id_ == "":
            clipboard.copy(self.sp.current_playback()["item"]["external_urls"]["spotify"])
        else:
            clipboard.copy(self.sp.track(id_)["external_urls"]["spotify"])

    def add_to_playlist(self, ids: dict):
        user = environ.get("SPOTIFY_USERNAME")
        playlist_items = self.sp.playlist_tracks(ids["playlist"])["items"]
        is_duplicate = False
        for item in playlist_items:
            if item["track"]["id"] == ids["song"]:
                is_duplicate = True
                break

        if not is_duplicate:
            self.sp.user_playlist_add_tracks(user, ids["playlist"], [f"spotify:track:{ids['song']}"])
        else:
            print("[WARNING] Track not added to playlist as it is a duplicate")


    def exit_app(self):
        kill(getpid(), 9)

