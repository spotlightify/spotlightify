import sys
from threading import Thread
from src.shortcuts import listener
from PyQt5.QtCore import Qt
from PyQt5.QtGui import QIcon
from PyQt5.QtWidgets import QApplication, QMenu, QAction, QSystemTrayIcon
from src.ui import Ui
import time

app = QApplication([])
app.setQuitOnLastWindowClosed(False)


def exit_app():
    app.quit()
    exit()


def show_ui():
    if not ui.isActiveWindow():
        ui.show()
    time.sleep(0.1)
    ui.raise_()
    ui.activateWindow()
    ui.textbox.setFocus()


# Create icon
icon = QIcon('assets/img/logo_small.png')

# UI
ui = Ui()

# clipboard = QApplication.clipboard()


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
