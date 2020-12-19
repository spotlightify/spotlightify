import sys
from os import sep, kill, getpid
from platform import platform
from sys import exit
from threading import Thread

from PyQt5.QtGui import QIcon
from PyQt5.QtWidgets import QApplication, QMenu, QAction, QSystemTrayIcon
from pynput.mouse import Controller, Button
from spotipy import Spotify

from auth import config, AuthUI
from caching import CacheManager, SongQueue, ImageQueue
from colors import colors
from definitions import ASSETS_DIR
from settings import default_themes
from shortcuts import listener
from ui import SpotlightUI

from settings.preferences import Preferences


class App:
    def __init__(self):
        print(f"{colors.PINK}{colors.BOLD}Welcome to Spotlightify{colors.RESET}\n\n")

        self.app = QApplication([])
        self.app.setQuitOnLastWindowClosed(False)

        self.theme = default_themes["dark"]

        self.tray = None
        self.tray_menu = None
        self.action_open = None
        self.action_exit = None

        self.preferences = Preferences()

        self.oauth = None
        self.config = config

        self.spotlight = None
        self.spotify = None
        self.oauth = None
        self.token_info = None

        self.listener_thread = Thread(target=listener, daemon=True, args=(self.show_spotlight,))
        self.song_queue = None
        self.image_queue = None
        self.cache_manager = None

        self.run()

    def run(self):
        # Pre checks in event of no config.json
        # Validation dependencies

        if not self.config.is_valid():
            app = QApplication([])
            app.setQuitOnLastWindowClosed(True)
            auth = AuthUI()

            while not self.config.is_valid():
                auth.show()
                app.exec_()
                if auth.isCanceled:
                    sys.exit()
        while True:
            self.ui_invoke()

    def ui_invoke(self):
        """
        Runs authorisation process
        and invokes the UI.
        """

        try:
            print(f"{colors.BLUE}Starting auth process...{colors.RESET} \n\n ")
            self.oauth = self.config.get_oauth()
            self.token_info = self.oauth.get_access_token(as_dict=True)
            self.spotify = Spotify(auth=self.token_info["access_token"])
            self.init_tray()

            self.listener_thread.start()
            self.song_queue = SongQueue()
            self.image_queue = ImageQueue()
            self.cache_manager = CacheManager(self.spotify, self.song_queue, self.image_queue)

            self.spotlight = SpotlightUI(self.spotify, self.song_queue)

            self.show_spotlight()
            while True:
                self.app.exec_()

        except Exception as ex:
            print(ex)

    def init_tray(self):
        self.tray_menu = QMenu()

        self.action_open = QAction("Open")
        self.action_open.triggered.connect(self.show_spotlight)
        self.tray_menu.addAction(self.action_open)

        self.action_exit = QAction("Exit")
        self.action_exit.triggered.connect(App.exit)
        self.tray_menu.addAction(self.action_exit)

        self.tray = QSystemTrayIcon()
        self.tray.setIcon(QIcon(f"{ASSETS_DIR}img{sep}logo_small.png"))
        self.tray.setVisible(True)
        self.tray.setToolTip("Spotlightify")
        self.tray.setContextMenu(self.tray_menu)
        self.tray.activated.connect(lambda reason: self.show_spotlight(reason=reason))

    def show_spotlight(self, **kwargs):
        def focus_windows():  # Only way to focus UI on Windows
            mouse = Controller()
            # mouse position before focus
            mouse_pos_before = mouse.position
            # changing the mouse position for click
            target_pos_x = ui.pos().x() + ui.textbox.pos().x()
            target_pos_y = ui.pos().y() + ui.textbox.pos().y()
            mouse.position = (target_pos_x, target_pos_y)
            mouse.click(Button.left)
            mouse.position = mouse_pos_before


        if kwargs and kwargs["reason"] != 3:
            # if kwargs contains "reason" this has been invoked by the tray icon being clicked
            # reason = 3 means the icon has been left-clicked, so anything other than a left click
            # should open the context menu
            return

        ui = self.spotlight
        ui.show()
        ui.raise_()
        ui.activateWindow()
        ui.function_row.refresh(None)  # refreshes function row button icons
        self.token_refresh()


        if "Windows" in platform():
            focus_windows()


    def token_refresh(self):
        try:
            if self.oauth.is_token_expired(token_info=self.token_info):
                self.token_info = self.oauth.refresh_access_token(self.token_info["refresh_token"])
                self.spotify.set_auth(self.token_info["access_token"])
        except Exception as ex:
            print(f"[WARNING] Could not refresh user API token \n \n {ex}")

    @staticmethod
    def exit():
        print(f"\n{colors.PINK}{colors.BOLD}Exiting{colors.RESET}")
        kill(getpid(), 3)
        exit(0)


if __name__ == "__main__":
    App()
