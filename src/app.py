from threading import Thread
from src.shortcuts import listener
from PyQt5.QtGui import QIcon
from PyQt5.QtWidgets import QApplication, QMenu, QAction, QSystemTrayIcon
from src.ui import show_ui

app = QApplication([])
app.setQuitOnLastWindowClosed(False)


def exit_app():
    app.quit()
    exit()


# Create icon
icon = QIcon('/assets/img/logo_small.png')

# clipboard = QApplication.clipboard()

listener_thread = Thread(target=listener)
listener_thread.start()

# Create tray
tray = QSystemTrayIcon()
tray.setIcon(icon)
tray.setVisible(True)

# Create menu
menu = QMenu()
open_ui = QAction("Open")
open_ui.triggered.connect(show_ui)
menu.addAction(open_ui)

exit = QAction("Exit")
exit.triggered.connect(exit_app)
menu.addAction(exit)

# Add the menu to the tray
tray.setContextMenu(menu)

app.exec_()
