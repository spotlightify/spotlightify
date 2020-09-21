from spotlight.items.item import Item
from api.manager import PlaybackManager

# Item classes that are used in more than one file should be written into this file
from spotlight.items.options import DisplaySongOption, SongOptions


class PlayableItem(Item):
    def __init__(self, title: str, description: str, icon: str, function: classmethod, parameter: str, prefix: str,
                 setting: str):
        Item.__init__(self, title, description, icon, function, parameter, prefix, setting)
        self.option_items = []


class SongItem(PlayableItem):
    def __init__(self, name: str, artists: str, image_name: str, id_: str):
        """
        Song Item Class
        :param name: Name of the song
        :param artists: Artists associated with the song
        :param image_name: This is the ALBUM ID of a song, use "" if the song is not cached
        :param id_: id/uri/term for song
        """
        PlayableItem.__init__(self, name, f"By {artists}", image_name if len(image_name) == 22 else "play",
                            PlaybackManager.play_song, "", id_, "exe")
        self.option_items = SongOptions.create_song_options(name, artists, image_name, id_)


class QueueItem(PlayableItem):
    def __init__(self, name: str, artists: str, image_name: str, id_: str):
        """
        Queue Item Class
        :param name: Name of the song
        :param artists: Artists associated with the song
        :param image_name: This is the ALBUM ID of a song, use "" if the song is not cached
        :param id_: id/uri/term for song
        """
        PlayableItem.__init__(self, name, f"By {artists}", image_name if len(image_name) == 22 else "list",
                            PlaybackManager.queue_song, "", id_, "exe")


class PlaylistItem(PlayableItem):
    def __init__(self, name: str, owner: str, image_name: str, id_: str):
        """
        Playlist Item Class
        :param name: Name of the playlist
        :param owner: owner associated with the playlist
        :param image_name: This is the PLAYLIST ID of a playlist, use "" if the song is not cached
        :param id_: id/uri for playlist
        """
        PlayableItem.__init__(self, name, f"By {owner}", image_name if len(image_name) == 22 else "playlist",
                            PlaybackManager.play_playlist, "", id_, "exe")


class ArtistItem(PlayableItem):
    def __init__(self, name: str, genre: str, image_name: str, id_: str):
        """
        Artist Item Class
        :param name: Name of the artist
        :param genre: artists main genre
        :param image_name: This is the ARTIST ID, use "" if the song is not cached
        :param id_: id/uri for artist
        """
        PlayableItem.__init__(self, name, genre, image_name if len(image_name) == 22 else "artist",
                            PlaybackManager.play_artist, "", id_, "exe")


class AlbumItem(PlayableItem):
    def __init__(self, name: str, artists: str, image_name: str, id_: str):
        """
        Album Item Class
        :param name: Name of the album
        :param artists: artists associated with album
        :param image_name: This is the ALBUM ID, use "" if the song is not cached
        :param id_: id/uri for album
        """
        PlayableItem.__init__(self, name, f"By {artists}", image_name if len(image_name) == 22 else "album",
                            PlaybackManager.play_album, "", id_, "exe")
