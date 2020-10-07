from PyQt5.QtCore import Qt
from PyQt5.QtWidgets import QLabel, QWidget, QPushButton

from spotlight.suggestions.suggestion import Suggestion
from api import check, toggle, playback
from PyQt5.QtSvg import QSvgWidget
from PyQt5.QtGui import QPixmap
from definitions import ASSETS_DIR
from os import sep


class FunctionButtonsRow(QWidget):
    def __init__(self, parent, sp):
        QWidget.__init__(self, parent)
        # creates a useful function object
        self.sp = sp
        toggles = toggle.ToggleFunctions(sp)
        playback_change = playback.PlaybackFunctions(sp)
        # gets the current theme
        self.active_theme = parent.active_theme
        # gets the font
        self.custom_font = parent.custom_font
        # makes styling quick
        self.buttons = []
        # setting height the row
        self.resize(540, 47)
        # widget creation, load and setup of icons
        # shuffle button
        self.shuffle_button = SvgButton(self, f"{ASSETS_DIR}svg{sep}shuffle.svg")
        self.shuffle_button.clicked.connect(lambda: self.refresh(toggles.shuffle()))
        # self.shuffle_button.mousePressEvent(self.shuffle_button_press())
        self.buttons.append(self.shuffle_button)
        # backward button
        self.backward_button = SvgButton(self, f"{ASSETS_DIR}svg{sep}backward.svg")
        self.backward_button.clicked.connect(lambda: self.refresh(playback_change.previous()))
        # self.backward_button.mousePressEvent(print("backward test"))
        self.buttons.append(self.backward_button)
        # pause/play button
        self.pause_play_button = SvgButton(self, f"{ASSETS_DIR}svg{sep}pause.svg")
        self.pause_play_button.clicked.connect(lambda: self.refresh(toggles.playback()))
        # self.pause_play_button.mousePressEvent(print("pause/play test"))
        self.buttons.append(self.pause_play_button)
        # forward button
        self.forward_button = SvgButton(self, f"{ASSETS_DIR}svg{sep}forward.svg")
        self.forward_button.clicked.connect(lambda: self.refresh(playback_change.skip()))
        # self.forward_button.mousePressEvent(print("forward test"))
        self.buttons.append(self.forward_button)
        # repeat button
        self.like_button = SvgButton(self, f"{ASSETS_DIR}svg{sep}heart-no-fill.svg")
        self.like_button.clicked.connect(lambda: self.refresh(toggles.like_song()))
        self.refresh(None)
        # self.like_button.mousePressEvent(print("repeat test"))
        self.buttons.append(self.like_button)
        self.set_style()

    def set_style(self):
        gap = 120
        for button in self.buttons:
            button.setSize(20, 20)
            button.move(gap, 13)
            gap += 70

    def refresh(self, method):
        if method is not None:
            method()
        checks = check.CheckFunctions(self.sp)
        if checks.is_song_liked():
            self.like_button.load_svg(f"{ASSETS_DIR}svg{sep}heart.svg")
        else:
            self.like_button.load_svg(f"{ASSETS_DIR}svg{sep}heart-no-fill.svg")

        if checks.is_song_playing():
            self.pause_play_button.load_svg(f"{ASSETS_DIR}svg{sep}pause.svg")
        else:
            self.pause_play_button.load_svg(f"{ASSETS_DIR}svg{sep}play.svg")

        if checks.is_shuffle_on():
            self.shuffle_button.load_svg(f"{ASSETS_DIR}svg{sep}shuffle.svg")
        else:
            self.shuffle_button.load_svg(f"{ASSETS_DIR}svg{sep}shuffle-off.svg")


class SvgButton(QPushButton):
    def __init__(self, parent, svg_path):
        QWidget.__init__(self, parent)
        self.svg = QSvgWidget(self)
        self.svg.load(svg_path)
        self.setFocusPolicy(Qt.NoFocus)

    def setSize(self, w, h) -> None:
        self.resize(w, h)
        self.svg.resize(w, h)

    def load_svg(self, svg_path):
        self.svg.load(svg_path)


class SuggestRow(QPushButton):
    def __init__(self, parent, suggestion: Suggestion):
        QWidget.__init__(self, parent)
        # defines whether the command has associated options
        self.has_options = True if hasattr(suggestion, "option_suggestions") else False
        # gets the current theme
        self.active_theme = parent.active_theme
        # gets the font
        self.custom_font = parent.custom_font
        # setting height the row
        width, height = [parent.width(), 57]
        self.resize(width, height)
        # makes command dictionary a class variable
        self.suggestion = suggestion # Stores information about the command the row will hold
        # widget creation
        self.icon = None  # This can either be an svg or jpg file
        icon_path = self.suggestion.icon_name  # gets the icon path
        if "svg" in icon_path:
            self.icon = QSvgWidget(self)
            self.icon.load(icon_path)
        else:
            pixmap = QPixmap(icon_path)
            icon = QLabel(self)
            icon.setPixmap(pixmap)
            self.icon = icon
        self.title_lbl = QLabel(self.suggestion.title, self)
        self.description_lbl = QLabel(self.suggestion.description, self)
        self.option_icon = QSvgWidget(self)
        self.option_icon.load(f"{ASSETS_DIR}svg{sep}ellipsis.svg")
        self.set_style()

    def set_style(self):
        # TODO: Add support for theming for icon and layout scalability components
        # set style and location of icon
        if "svg" in self.suggestion.icon_name:  # different location and sizes depending on icon type
            self.icon.move(18, 18)
            self.icon.resize(20, 20)
            self.icon.setStyleSheet("background-color: rgba(0,0,0,0%);")
        else:
            self.icon.move(8, 8)
            self.icon.resize(40, 40)
            self.icon.setAlignment(Qt.AlignCenter)
            self.icon.setScaledContents(True)
        # set style for options icon
        self.option_icon.move(490, 16)
        self.option_icon.resize(25, 25)
        self.option_icon.setStyleSheet("background-color: rgba(0,0,0,0%);")
        self.option_icon.hide()
        # set style and location of title
        self.title_lbl.move(56, 9)
        self.title_lbl.setStyleSheet(
            f"font-size: 20px; color: {self.active_theme.foreground}; background-color: rgba(0,0,0,0%);")
        self.title_lbl.setFont(self.custom_font)
        # set style and location of description
        self.description_lbl.resize(479, 15)
        self.description_lbl.move(56, 33)
        self.description_lbl.setStyleSheet(
            f"font-size: 13px; color: {self.active_theme.foreground}; background-color: rgba(0,0,0,0%);")
        self.description_lbl.setFont(self.custom_font)
        # style for widget
        self.setStyleSheet('''
        QPushButton {
            border: none;
        }
        QPushButton:hover {
            background-color: #251e1e;
        }
        QPushButton:hover:focus {
            background-color: #322828;
        }
        QPushButton:focus {
            background-color: #3f3232;
            outline: 0px
        }
        ''')

    def show_option_icon(self):
        if self.has_options:
            self.option_icon.show()

    def hide_option_icon(self):
        if self.has_options:
            self.option_icon.hide()

