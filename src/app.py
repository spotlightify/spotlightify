import sys
from threading import Thread
from queue import Queue
from spotipy import Spotify, util, oauth2
from config import USERNAME, CLIENT_ID, CLIENT_SECRET
from os import sep
from src.shortcuts import listener
from PyQt5.QtGui import QIcon
from PyQt5.QtWidgets import QApplication, QMenu, QAction, QSystemTrayIcon
from src.ui import Ui
from time import sleep
from definitions import ASSETS_DIR
from src.interactions import Interactions
from src.caching import CachingThread, SongCachingThread, ImageCachingThread, ImageQueue

app = QApplication([])
app.setQuitOnLastWindowClosed(False)

redirect_uri = "http://localhost:8080"
scope = "streaming user-library-read user-modify-playback-state user-read-playback-state user-library-modify " \
        "playlist-read-private playlist-read-private "

sp_oauth = oauth2.SpotifyOAuth(client_id=CLIENT_ID, client_secret=CLIENT_SECRET, redirect_uri=redirect_uri,
                                       scope=scope, username=USERNAME)
token_info = sp_oauth.get_cached_token()
if not token_info:
    token = util.prompt_for_user_token(USERNAME, scope=scope, client_id=CLIENT_ID, client_secret=CLIENT_SECRET,
                                                    redirect_uri=redirect_uri)
    token_info = sp_oauth.get_cached_token()
else:
    token = token_info["access_token"]
try:
    sp = Spotify(auth=token)
except:
    print("User token could not be created")
    exit()

def exit_app():
    app.quit()
    exit()


def show_ui():
    sleep(0.1)
    if not ui.isActiveWindow() or ui.isHidden():
        ui.show()
    interactions.refresh_token()
    ui.raise_()
    ui.activateWindow()
    ui.function_row.refresh()  # refreshes function row buttons


# creates the interactions object
interactions = Interactions(sp, token_info, sp_oauth, exit_app)

# UI
ui = Ui(interactions)



# Create icon
icon = QIcon(f"{ASSETS_DIR}{sep}img{sep}logo_small.png")

# Create tray
tray = QSystemTrayIcon()
tray.setIcon(icon)
tray.setVisible(True)
tray.setToolTip("Spotlightify")
tray.activated.connect(show_ui)

# Create menu
menu = QMenu()
open_ui = QAction("Open")
open_ui.triggered.connect(show_ui)
menu.addAction(open_ui)

exit_ = QAction("Exit")
exit_.triggered.connect(exit_app)
menu.addAction(exit_)

listener_thread = Thread(target=listener, daemon=True, args=(open_ui,))
listener_thread.start()

queue = Queue()
image_queue = ImageQueue()

song_caching_thread = SongCachingThread(queue, image_queue)
song_caching_thread.start()

image_caching_thread = ImageCachingThread(image_queue)
image_caching_thread.start()

playlist_caching_thread = CachingThread(sp, "playlists", queue, image_queue)
playlist_caching_thread.start()
playlist_caching_thread = CachingThread(sp, "liked", queue, image_queue)
playlist_caching_thread.start()

# Add the menu to the tray
tray.setContextMenu(menu)

app.exec_()
