from threading import Thread
from pynput.mouse import Button, Controller
from queue import Queue
from spotipy import Spotify, oauth2
from os import sep, path, mkdir, kill, getpid, environ
from shortcuts import listener
from PyQt5.QtGui import QIcon
from PyQt5.QtWidgets import QApplication, QMenu, QAction, QSystemTrayIcon
from spotlight.ui import Ui
from time import sleep
from spotlight.interactions import Interactions
from definitions import ASSETS_DIR
from interactions import Interactions
from caching.manager import CacheManager
from caching.queues import SongQueue, ImageQueue
from colors import colors

#  Allow users to use the default spotipy env variables
if not (all(elem in environ for elem in ["SPOTIPY_CLIENT_ID", "SPOTIPY_CLIENT_SECRET", "SPOTIPY_REDIRECT_URI", "USERNAME"])):
    from config import USERNAME, CLIENT_ID, CLIENT_SECRET

    redirect_uri = "http://localhost:8080"
else:
    CLIENT_ID, CLIENT_SECRET, redirect_uri, USERNAME, = [environ[item] for item in
                                                         ["SPOTIPY_CLIENT_ID", "SPOTIPY_CLIENT_SECRET",
                                                          "SPOTIPY_REDIRECT_URI", "USERNAME"]]

app = QApplication([])
app.setQuitOnLastWindowClosed(False)
scope = "streaming user-library-read user-modify-playback-state user-read-playback-state user-library-modify " \
        "playlist-read-private playlist-read-private user-follow-read"

sp_oauth = oauth2.SpotifyOAuth(client_id=CLIENT_ID, client_secret=CLIENT_SECRET, redirect_uri=redirect_uri,
                               scope=scope, username=USERNAME)

token_info = sp_oauth.get_access_token(as_dict=True)
token = token_info["access_token"]

try:
    sp = Spotify(auth=token)
    print(f"{colors.PINK}{colors.BOLD}Welcome to Spotlightify{colors.RESET}\n\n")
except:
    print("User token could not be created")
    exit()


def exit_app():
    ui.close()  # visually removes ui quicker
    kill(getpid(), 9)


def show_ui():
    if not ui.isActiveWindow() or ui.isHidden():
        ui.show()
    sleep(0.1)
    interactions.refresh_token()
    ui.raise_()
    ui.activateWindow()
    focus_ui()
    ui.function_row.refresh(None)  # refreshes function row buttons


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


def tray_icon_activated(reason):
    if reason == tray.Trigger:  # tray.Trigger is left click
        show_ui()


song_queue = SongQueue()
image_queue = ImageQueue()

# creates the interactions object
interactions = Interactions(sp, token_info, sp_oauth, exit_app, song_queue)

# UI
ui = Ui(interactions, sp)

# Create icon
icon = QIcon(f"{ASSETS_DIR}img{sep}logo_small.png")

# Create tray
tray = QSystemTrayIcon()
tray.setIcon(icon)
tray.setVisible(True)
tray.setToolTip("Spotlightify")

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

cache_manager = CacheManager(sp, song_queue, image_queue)

# Add the menu to the tray
tray.setContextMenu(menu)
tray.activated.connect(tray_icon_activated)

app.exec_()
