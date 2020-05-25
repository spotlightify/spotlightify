import sys
from threading import Thread
from src.shortcuts import listener
from PyQt5.QtCore import Qt
from PyQt5.QtGui import QIcon
from PyQt5.QtWidgets import QApplication, QMenu, QAction, QSystemTrayIcon
from src.ui import Ui
from time import sleep
from definitions import ASSETS_DIR

app = QApplication([])
app.setQuitOnLastWindowClosed(False)

# UI
ui = Ui()


def exit_app():
    app.quit()
    exit()


def show_ui():
    sleep(0.1)
    if not ui.isActiveWindow():
        ui.show()
    ui.raise_()
    ui.activateWindow()


# Create icon
icon = QIcon(f"{ASSETS_DIR}/img/logo_small.png")

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

# Add the menu to the tray
tray.setContextMenu(menu)

app.exec_()
