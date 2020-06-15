from os import sep, environ
from threading import Thread
from time import sleep

from PyQt5.QtGui import QIcon
from PyQt5.QtWidgets import QApplication, QMenu, QAction, QSystemTrayIcon
from pynput.mouse import Button, Controller
from spotipy import Spotify, oauth2

from caching.manager import CacheManager
from caching.queues import SongQueue, ImageQueue
from colors import colors
from definitions import ASSETS_DIR
from shortcuts import listener
from spotlight.commands.handler import CommandHandler
from spotlight.manager.manager import PlaybackManager
from spotlight.ui import Ui

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
        "playlist-read-private playlist-read-private playlist-read-collaborative user-follow-read"

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


def show_ui():
    if not ui.isActiveWindow() or ui.isHidden():
        ui.show()
    sleep(0.1)
    ui.raise_()
    ui.activateWindow()
    focus_ui()
    ui.function_row.refresh(None)  # refreshes function row buttons
    refresh_token()


def refresh_token():
    try:
        global token_info
        if sp_oauth.is_token_expired(token_info=token_info):
            token_info = sp_oauth.refresh_access_token(token_info['refresh_token'])
            token = token_info['access_token']
            sp = Spotify(auth=token)
            token_info = sp_oauth.get_access_token(as_dict=True)
    except:
        print("[WARNING] Could not refresh user API token")



def focus_ui():
    """
    Moves mouse, clicks and then unclicks.
    """
    mouse = Controller()
    mouse_pos_before = mouse.position
    pos_x = ui.pos().x() + ui.textbox.pos().x()
    pos_y = ui.pos().y() + ui.textbox.pos().y()
    mouse.move(pos_x, pos_y)
    mouse.click(Button.left)
    mouse.release(Button.left)


def tray_icon_activated(reason):
    if reason == tray.Trigger:  # tray.Trigger is left click
        show_ui()


song_queue = SongQueue()
image_queue = ImageQueue()

# Command Handler
command_handler = CommandHandler(sp, song_queue)
# UI
ui = Ui(sp, command_handler)

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
exit_.triggered.connect(lambda: PlaybackManager(sp, song_queue).exit_app())
menu.addAction(exit_)

listener_thread = Thread(target=listener, daemon=True, args=(open_ui,))
listener_thread.start()

cache_manager = CacheManager(sp, song_queue, image_queue)

# Add the menu to the tray
tray.setContextMenu(menu)
tray.activated.connect(tray_icon_activated)

app.exec_()
