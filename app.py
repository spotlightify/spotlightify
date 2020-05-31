from threading import Thread
from pynput.mouse import Button, Controller
from queue import Queue
from spotipy import Spotify, util, oauth2
from os import sep, path, mkdir
from shortcuts import listener
from PyQt5.QtGui import QIcon
from PyQt5.QtWidgets import QApplication, QMenu, QAction, QSystemTrayIcon
from ui import Ui
from time import sleep
from definitions import ASSETS_DIR, CACHE_DIR
from interactions import Interactions
from caching import CachingThread, SongCachingThread, ImageCachingThread, ImageQueue
import os

#  Allow users to use the default spotipy env variables
if not (all(elem in os.environ for elem in ["SPOTIPY_CLIENT_ID", "SPOTIPY_CLIENT_SECRET", "SPOTIPY_REDIRECT_URI", "USERNAME"])):
    from config import USERNAME, CLIENT_ID, CLIENT_SECRET
    redirect_uri = "http://localhost:8080"
else:
    CLIENT_ID, CLIENT_SECRET, redirect_uri, USERNAME, = [os.environ[item] for item in ["SPOTIPY_CLIENT_ID", "SPOTIPY_CLIENT_SECRET", "SPOTIPY_REDIRECT_URI", "USERNAME"]]
app = QApplication([])
app.setQuitOnLastWindowClosed(False)
scope = "streaming user-library-read user-modify-playback-state user-read-playback-state user-library-modify " \
        "playlist-read-private playlist-read-private"

sp_oauth = oauth2.SpotifyOAuth(client_id=CLIENT_ID, client_secret=CLIENT_SECRET, redirect_uri=redirect_uri,
                                       scope=scope, username=USERNAME)

token_info = sp_oauth.get_access_token(as_dict=True)
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
    if not ui.isActiveWindow() or ui.isHidden():
        ui.show()
    sleep(0.1)
    interactions.refresh_token()
    ui.raise_()
    ui.activateWindow()
    focus_ui()
    ui.function_row.refresh()  # refreshes function row buttons


def focus_ui():  # Only way I could think of to properly focus the ui
    mouse = Controller()
    # mouse position before focus
    mouse_pos_before = mouse.position
    # changing the mouse position for click
    target_pos_x = ui.pos().x() + ui.textbox.pos().x()
    target_pos_y = ui.pos().y() + ui.textbox.pos().y()
    mouse.position = (target_pos_x, target_pos_y)
    mouse.click(Button.left)
    mouse.position = mouse_pos_before


def create_cache():
    if not path.exists(CACHE_DIR):
        mkdir(CACHE_DIR)


queue = Queue()
image_queue = ImageQueue()

# creates the interactions object
interactions = Interactions(sp, token_info, sp_oauth, exit_app, queue)

# UI
ui = Ui(interactions)

# Create icon
icon = QIcon(f"{ASSETS_DIR}img{sep}logo_small.png")

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

create_cache()

song_caching_thread = SongCachingThread(queue, image_queue)
song_caching_thread.start()

image_caching_thread = ImageCachingThread(image_queue)
image_caching_thread.start()

playlist_caching_thread = CachingThread(sp, "playlists", queue, image_queue)
playlist_caching_thread.start()
liked_caching_thread = CachingThread(sp, "liked", queue, image_queue)
liked_caching_thread.start()

# Add the menu to the tray
tray.setContextMenu(menu)

app.exec_()
