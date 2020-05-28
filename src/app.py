import sys
from threading import Thread
from queue import Queue

import spotipy

import config
from os import sep
from src.shortcuts import listener
from PyQt5.QtCore import Qt
from PyQt5.QtGui import QIcon
from PyQt5.QtWidgets import QApplication, QMenu, QAction, QSystemTrayIcon
from src.ui import Ui
from time import sleep
from definitions import ASSETS_DIR
from src.interactions import Interactions
from src.caching import CachingThread, SongCachingThread

app = QApplication([])
app.setQuitOnLastWindowClosed(False)

# Creates spotipy object
client_ID = config.CLIENT_ID
client_secret = config.CLIENT_SECRET
redirect_uri = "http://localhost:8080"
username = config.USERNAME
scope = "streaming user-library-read user-modify-playback-state user-read-playback-state user-library-modify " \
        "playlist-read-private playlist-read-private "
token = spotipy.util.prompt_for_user_token(username, scope=scope, client_id=client_ID, client_secret=client_secret,
                                           redirect_uri=redirect_uri)
sp = None
if token:
    sp = spotipy.Spotify(auth=token)
else:
    print("Error: Can't get token for " + username)
    exit()
# creates the interactions object
interactions = Interactions(sp, username, client_ID, client_secret, scope, redirect_uri)

# UI
ui = Ui(interactions)


def exit_app():
    app.quit()
    exit()


def show_ui():
    sleep(0.1)
    if not ui.isActiveWindow() or ui.isHidden():
        ui.show()
    ui.raise_()
    ui.activateWindow()
    ui.function_row.refresh()  # refreshes function row buttons


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

song_caching_thread = SongCachingThread(queue)
song_caching_thread.start()

playlist_caching_thread = CachingThread(sp, queue)
playlist_caching_thread.start()


# Add the menu to the tray
tray.setContextMenu(menu)

app.exec_()
