import sys
from os import sep, kill, getpid
from threading import Thread
from time import sleep
from sys import exit
from platform import platform

from PyQt5.QtGui import QIcon
from PyQt5.QtWidgets import QApplication, QMenu, QAction, QSystemTrayIcon
from pynput.mouse import Controller, Button
from spotipy import Spotify

from shortcuts import listener
from spotlight import SpotlightUI
from colors import colors
from definitions import ASSETS_DIR

from caching import CacheManager, SongQueue, ImageQueue
from auth import Config, AuthUI, config
from settings import Theme, default_themes
from ui import UIEventQueue, UIManager


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

        self.config = config

        self.ui_event_queue = UIEventQueue()
        self.ui_manager = UIManager(self.ui_event_queue)

        self.spotlight = None
        self.spotify = None
        self.oauth = None

        self.listener_thread = Thread(target=listener, daemon=True, args=(self.show_spotlight,))
        self.song_queue = None
        self.image_queue = None
        self.cache_manager = None
        # a = AuthUI(self.config)
        # self.ui_manager.add("auth", self.auth_ui)

        self.run()

    def run(self):
        print(self.config.username)

        app = QApplication([])
        app.setQuitOnLastWindowClosed(True)
        auth = AuthUI()
        while not self.config.is_valid():
            auth.show()
            app.exec_()
            if auth.isCanceled:
                sys.exit()

        try:
            print("Starting auth process")
            self.oauth = self.config.get_oauth()
            token = self.oauth.get_access_token(as_dict=True)["access_token"]
            self.spotify = Spotify(auth=token)
            self.spotlight = SpotlightUI(self.spotify, self.song_queue)

            # self.ui_manager.add("spotlight", SpotlightUI(self.spotify, self.song_queue))

            self.init_tray()

            self.listener_thread.start()
            self.song_queue = SongQueue()
            self.image_queue = ImageQueue()
            self.cache_manager = CacheManager(self.spotify, self.song_queue, self.image_queue)
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
        def focus_windows(): # Only way to focus UI on Windows
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
        self.refresh_token()


        if "Windows" in platform():
            focus_windows()


    def refresh_token(self):
        try:
            current_token = self.oauth.get_access_token()
            if self.oauth.is_token_expired(token_info=current_token):
                token = self.oauth.refresh_access_token(current_token["refresh_token"])
                self.spotify = Spotify(auth=token["access_token"])
        except:
            print("[WARNING] Could not refresh user API token")

    @staticmethod
    def exit():
        print(f"\n{colors.PINK}{colors.BOLD}Exiting{colors.RESET}")
        kill(getpid(), 9)
        exit(0)


if __name__ == "__main__":
    App()
