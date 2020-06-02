import spotipy


class PlaybackFunctions:
    def __init__(self, sp: spotipy.Spotify):
        self.sp = sp

    def skip(self):
        try:
            self.sp.next_track()
        except:
            print("[Error] Cannot skip track.")

    def previous(self):
        try:
            self.sp.previous_track()
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
            self.sp.seek_track(time, self.current_device_id)
            self.resume_playback()
        except:
            print("[ERROR] Invalid time give. Valid command example: go to 1:40")