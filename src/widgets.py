from PyQt5.QtCore import Qt
from PyQt5.QtWidgets import QLabel, QWidget, QApplication, QPushButton
from PyQt5.QtSvg import QSvgWidget
from PyQt5.QtGui import QPixmap


class FunctionButtonsRow(QWidget):
    def __init__(self, parent):
        QWidget.__init__(self, parent)
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
        self.shuffle_button = QSvgWidget(self)
        self.shuffle_button.load("assets/svg/shuffle.svg")
        # self.shuffle_button.mousePressEvent(self.shuffle_button_press())
        self.buttons.append(self.shuffle_button)
        # backward button
        self.backward_button = QSvgWidget(self)
        self.backward_button.load("assets/svg/backward.svg")
        # self.backward_button.mousePressEvent(print("backward test"))
        self.buttons.append(self.backward_button)
        # play button
        self.pause_play_button = QSvgWidget(self)
        self.pause_play_button.load("assets/svg/pause.svg")
        # self.pause_play_button.mousePressEvent(print("pause/play test"))
        self.buttons.append(self.pause_play_button)
        # forward button
        self.forward_button = QSvgWidget(self)
        self.forward_button.load("assets/svg/forward.svg")
        # self.forward_button.mousePressEvent(print("forward test"))
        self.buttons.append(self.forward_button)
        # repeat button
        self.like_button = QSvgWidget(self)
        self.like_button.load("assets/svg/heart.svg")
        # self.like_button.mousePressEvent(print("repeat test"))
        self.buttons.append(self.like_button)
        self.set_style()

    def set_style(self):
        gap = 120
        for button in self.buttons:
            button.resize(20, 20)
            button.move(gap, 13)
            gap += 70


class SuggestRow(QPushButton):
    def __init__(self, parent, command_dict):
        QWidget.__init__(self, parent)
        # gets the current theme
        self.active_theme = parent.active_theme
        # gets the font
        self.custom_font = parent.custom_font
        # setting height the row
        height, width = [parent.width(), 114]
        self.resize(height, width)
        # makes command dictionary a class variable
        self.command_dict = command_dict  # Stores information about the command the row will hold
        # widget creation
        self.icon = None  # This can either be an svg or jpg file
        icon_path = command_dict["icon"]  # gets the icon path
        if "svg" in icon_path:
            self.icon = QSvgWidget(self)
            self.icon.load(icon_path)
        else:
            pixmap = QPixmap(icon_path)
            icon = QLabel(self)
            icon.setPixmap(pixmap)
            self.icon = icon
        self.title_lbl = QLabel(command_dict["title"], self)
        self.description_lbl = QLabel(command_dict["description"], self)
        self.set_style()

    def set_style(self):
        # TODO: Add support for theming for icon and layout scalability components
        # set style and location of icon
        if "svg" in self.command_dict["icon"]:  # different location and sizes depending on icon type
            self.icon.move(18, 18)
            self.icon.resize(20, 20)
            self.icon.setStyleSheet("background-color: rgba(0,0,0,0%);")
        else:
            self.icon.move(8, 8)
            self.icon.resize(40, 40)
            self.icon.setAlignment(Qt.AlignCenter)
            self.icon.setScaledContents(True)
        # set style and location of title
        self.title_lbl.move(56, 9)
        self.title_lbl.setStyleSheet(f"font-size: 20px; color: {self.active_theme['text']}; background-color: rgba(0,0,0,0%);")
        self.title_lbl.setFont(self.custom_font)
        # set style and location of description
        self.description_lbl.resize(479, 15)
        self.description_lbl.move(56, 33)
        self.description_lbl.setStyleSheet(f"font-size: 13px; color: {self.active_theme['text']}; background-color: rgba(0,0,0,0%);")
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


def set_theme(active_theme, row_input, row_function_buttons):
    pass
