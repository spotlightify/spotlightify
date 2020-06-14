import spotipy


class MiscFunctions:
    def __init__(self, sp: spotipy.Spotify):
        self.sp = sp

    def get_device_list(self) -> list:
        try:
            return self.sp.devices()["devices"]
        except:
            print("[Error] Cannot get list of devices")
            return None

    def set_device(self, id_: str):
        try:
            self.sp.transfer_playback(id_, True)
        except:
            None

    def set_default_device(self):
        try:
            device_id = self.sp.devices()["devices"][0]["id"]
            self.sp.transfer_playback(device_id, True)
        except:
            print("[Error] could not select default device.")

    def set_volume(self, value: int):
        '''
        Changes the volume of the currently playing device
        :param value: int between 1 and 10
        '''
        try:
            if 0 <= value <= 10:
                self.sp.volume(value*10)
            else:
                raise Exception
        except:
            print("[Error] Invalid volume value. Valid command example: 'volume 8'")
