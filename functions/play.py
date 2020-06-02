from queue import Queue

import spotipy


class PlayFunctions:
    def __init__(self, sp: spotipy.Spotify, queue: Queue):
        self.sp = sp
        self._queue = queue

    def term(self, term: str):
        try:
            track = self.sp.search(term, limit=1, market="GB", type="track")["tracks"]["items"][0]
            uri = track["uri"]
            self.sp.start_playback(uris=[uri])
            self._queue.put(track)
        except:
            print("[Error] Could not play song from term inputted")

    def uri(self, uri: str):
        try:
            self.sp.start_playback(uris=[uri])
        except:
            print(f"[Error] Could not play {uri.split(':')[1]} from URI")

    def id(self, id_: str, type_: str):
        try:
            uri = f"spotify:{type_}:{id_}"
            self.sp.start_playback(uris=[uri])
        except:
            print(f"[Error] Could not play {type_} from ID")

    def liked_songs(self):
        try:
            results = self.sp.current_user_saved_tracks()
            tracks = results["items"]
            uris = []
            while results["next"]:
                results = self.sp.next(results)
                tracks.extend(results["items"])
            for track in tracks:
                uris.append(track["track"]["uri"])
            self.sp.start_playback(self.current_device_id, None, uris=uris)
        except:
            print("[ERROR] Could not play liked music")

    def queue(self, id_: str):
        try:
            uri = f"spotify:song:{id_}"
            self.sp.start_playback(uris=[uri])
        except:
            print(f"[Error] Could not queue song from ID")

    def term(self, term: str):
        try:
            track = self.sp.search(term, limit=1, market="GB", type="track")["tracks"]["items"][0]
            uri = track["uri"]
            self.sp.add_to_queue(uri)
            self._queue.put(track)
        except:
            print("[Error] Could not play song from term inputted")

    def queue_uri(self, uri: str):
        try:
            self.sp.start_playback(uri=[uri])
        except:
            print(f"[Error] Could not queue song from ID")
