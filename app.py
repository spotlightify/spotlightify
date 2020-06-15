from os import sep, kill, getpid
from threading import Thread
from time import sleep
from sys import exit

from PyQt5.QtGui import QIcon
from PyQt5.QtWidgets import QApplication, QMenu, QAction, QSystemTrayIcon
from spotipy import Spotify

from shortcuts import listener
from spotlight import SpotlightUI
from colors import colors
from definitions import ASSETS_DIR
from caching import CacheManager, SongQueue, ImageQueue
from auth import Config


class App:
    def __init__(self):
        print(f"{colors.PINK}{colors.BOLD}Welcome to Spotlightify{colors.RESET}\n\n")

        self.app = QApplication([])
        self.app.setQuitOnLastWindowClosed(False)

        self.tray = None
        self.spotlight = None

        self.config = Config()

        self.spotify = None
        self.oauth = None

        self.listener_thread = Thread(target=listener, daemon=True, args=(self.show_spotlight,))
        self.song_queue = None
        self.image_queue = None
        self.cache_manager = None

        self.run()

    def run(self):
        while not self.config.is_valid():
            print("invalid cfg")
            sleep(1)

        try:
            self.oauth = self.config.get_oauth()
            token = self.oauth.get_access_token(as_dict=True)["access_token"]
            self.spotify = Spotify(auth=token)

            self.init_tray()
            self.listener_thread.start()
            self.song_queue = SongQueue()
            self.image_queue = ImageQueue()
            self.cache_manager = CacheManager(self.spotify, self.song_queue, self.image_queue)
            self.spotlight = SpotlightUI(self.spotify, self.song_queue)

            self.app.exec_()

        except Exception as ex:
            print(ex)
            self.exit()

    def init_tray(self):
        def init_context_menu():
            menu = QMenu()

            action_open = QAction("Open")
            action_open.triggered.connect(self.show_spotlight)
            menu.addAction(action_open)

            action_exit = QAction("Exit")
            action_exit.triggered.connect(self.exit)
            menu.addAction(action_exit)

            return menu

        self.tray = QSystemTrayIcon()
        self.tray.setIcon(QIcon(f"{ASSETS_DIR}img{sep}logo_small.png"))
        self.tray.setVisible(True)
        self.tray.setToolTip("Spotlightify")
        self.tray.setContextMenu(init_context_menu())
        self.tray.activated.connect(lambda reason: self.show_spotlight(reason=reason))

    def refresh_token(self):
        try:
            current_token = self.oauth.get_access_token()
            if self.oauth.is_token_expired(token_info=current_token):
                token = self.oauth.refresh_access_token(current_token["refresh_token"])
                self.spotify = Spotify(auth=token["access_token"])
        except:
            print("[WARNING] Could not refresh user API token")

    def show_spotlight(self, **kwargs):
        if kwargs and kwargs["reason"] != 3:
            # if kwargs contains "reason" this has been invoked by the tray icon being clicked
            # reason = 3 means the icon has been left-clicked, so anything other than a left click
            # should open the context menu
            return

        # self.refresh_token()

        if not self.spotlight.isActiveWindow() or self.spotlight.isHidden():
            self.spotlight.show()

        sleep(0.1)
        self.spotlight.raise_()
        self.spotlight.activateWindow()

    @staticmethod
    def exit():
        print(f"\n{colors.PINK}{colors.BOLD}Exiting{colors.RESET}")
        kill(getpid(), 9)
        exit(0)


if __name__ == "__main__":
    App()
