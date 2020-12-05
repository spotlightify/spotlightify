from queue import Queue
from random import sample
import spotipy
from caching.holder import CacheHolder


class PlayFunctions:
    def __init__(self, sp: spotipy.Spotify, queue: Queue, spotifyplayer):
        self.sp = sp
        self.spotifyplayer = spotifyplayer
        self.__queue = queue

    def term(self, term: str):
        try:
            track = self.sp.search(term, limit=1, market="GB", type="track")["tracks"]["items"][0]
            uri = track["uri"]
            if self.spotifyplayer.isinitialized:
                self.spotifyplayer.command(self.spotifyplayer.play(uri.split(':')[-1]))
            else:
                self.sp.start_playback(uris=[uri])
            self.__queue.put(track)
        except:
            print("[Error] Could not play song from term inputted")

    def uri(self, uri: str):
        try:
            if "track" not in uri:
                if self.spotifyplayer.isinitialized:
                    self.spotifyplayer.command(self.spotifyplayer.play_from_context(uri))
                else:
                    self.sp.start_playback(context_uri=uri)
            else:
                if self.spotifyplayer.isinitialized:
                    self.spotifyplayer.command(self.spotifyplayer.play(uri.split(':')[-1]))
                else:
                    self.sp.start_playback(uris=[uri])
                track = self.sp.track(uri)
                self.__queue.put(track)
        except:
            print(f"[Error] Could not play {uri.split(':')[1]} from URI")

    def id(self, id_: str, type_: str):
        try:
            uri = f"spotify:{type_}:{id_}"
            if type_ == "track":
                if self.spotifyplayer.isinitialized:
                    self.spotifyplayer.command(self.spotifyplayer.play(id_))
                else:
                    self.sp.start_playback(uris=[uri])
                track = self.sp.track(uri)
                self.__queue.put(track)
            else:
                if self.spotifyplayer.isinitialized:
                    self.spotifyplayer.command(self.spotifyplayer.play_from_context(uri))
                else:
                    self.sp.start_playback(context_uri=uri)
        except:
            print(f"[Error] Could not play {type_} from ID")

    def liked_songs(self):
        songs_to_queue = 100
        try:
            liked_data = CacheHolder.liked_cache
            liked_length = len(liked_data["songs"])
            if liked_length == 0:
                return
            if liked_length < songs_to_queue:
                songs_to_queue = liked_length

            uris = []
            values = sample(liked_data["songs"].items(), songs_to_queue)

            for track in values:
                uris.append(f"spotify:track:{track[0]}")

            if self.spotifyplayer.isinitialized:
                self.spotifyplayer.command(self.spotifyplayer.play_from_uris(uris))
            else:
                self.sp.start_playback(uris=uris)
        except:
            print("[Error] Could not play liked music")

    def queue_uri(self, uri: str):
        try:
            if self.spotifyplayer.isinitialized:
                self.spotifyplayer.command(self.spotifyplayer.add_to_queue(uri.split(':')[-1]))
            else:
                self.sp.add_to_queue(uri)
            track = self.sp.track(uri)
            self.__queue.put(track)
        except:
            print(f"[Error] Could not queue song from URI")

    def queue_id(self, id_: str):
        try:
            uri = f"spotify:track:{id_}"
            if self.spotifyplayer.isinitialized:
                self.spotifyplayer.command(self.spotifyplayer.add_to_queue(id_))
            else:
                self.sp.add_to_queue(uri)
            track = self.sp.track(uri)
            self.__queue.put(track)
        except:
            print(f"[Error] Could not queue song from ID")

    def queue_term(self, term: str):
        try:
            track = self.sp.search(term, limit=1, market="GB", type="track")["tracks"]["items"][0]
            uri = track["uri"]
            if self.spotifyplayer.isinitialized:
                self.spotifyplayer.command(self.spotifyplayer.add_to_queue(uri.split(':')[-1]))
            else:
                self.sp.add_to_queue(uri=uri)
            self.__queue.put(track)
        except:
            print("[Error] Could not queue song from term inputted")

    def song_recommendations(self, id_: str):  # like a radio
        try:
            track = self.sp.track(id_)
            #uri = f"spotify:track:{id_}"
            results = self.sp.recommendations(seed_tracks=[track["id"]], limit=50)
            print(results)
            uris = [track["uri"] for track in results["tracks"]]
            if self.spotifyplayer.isinitialized:
                self.spotifyplayer.command(self.spotifyplayer.play_from_uris(uris))
            else:
                self.sp.start_playback(uris=uris)
        except:
            print(f"[Error] Could not play recommended songs")
