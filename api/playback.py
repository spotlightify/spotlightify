import spotipy
from api.limiter import Limiter


class PlaybackFunctions:
    def __init__(self, sp: spotipy.Spotify, spotifyplayer):
        self.sp = sp
        self.spotifyplayer = spotifyplayer

    def skip(self):
        try:
            self.spotifyplayer.command(self.spotifyplayer.skip)
        except:
            print("[Error] Cannot skip track.")

    def pause(self):
        try:
            self.spotifyplayer.command(self.spotifyplayer.pause)
        except:
            print("[Error] Could not pause playback.")

    def resume(self):
        try:
            self.spotifyplayer.command(self.spotifyplayer.resume)
        except:
            print("[Error] Could not resume playback.")

    def previous(self):
        try:
            self.spotifyplayer.command(self.spotifyplayer.previous)
        except:
            print("[Error]")

    def goto(self, time):
        try:
            """Get Seconds from time."""
            time_standard = str(time).count(":")
            if time_standard == 1:
                time = "0:" + str(time)
            h, m, s = time.split(':')
            time = (int(h) * 3600 + int(m) * 60 + int(s)) * 1000
            self.spotifyplayer.command(self.spotifyplayer.seek_to(time))
        except:
            print("[Error] Invalid time give. Valid command example: go to 1:40")

    @Limiter.rate_limiter(seconds=10)
    def get_current_song_info(self) -> dict:
        try:
            song = self.sp.current_user_playing_track()["item"]
            return {"name": song["name"], "artist": ", ".join([artist["name"] for artist in song["artists"]]),
                    "image": song["album"]["id"]}
        except:
            print("[Error] could not get current song information.")
            return {"name": "Nothing Currently Playing", "artist": ""}
