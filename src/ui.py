import os
import time

from PyQt5.QtWidgets import QApplication, QWidget, QDesktopWidget, QLineEdit, QPushButton
from PyQt5 import QtCore, QtGui, QtSvg
from src.widgets import FunctionButtonsRow, SuggestRow
from definitions import ASSETS_DIR
from src.widgets import SvgButton
from definitions import ROOT_DIR


class Ui(QWidget):
    QApplication.setAttribute(QtCore.Qt.AA_EnableHighDpiScaling, True)  # enable highdpi scaling
    QApplication.setAttribute(QtCore.Qt.AA_UseHighDpiPixmaps, True)  # use highdpi icon-base

    def __init__(self, interactions, parent=None):
        QWidget.__init__(self, parent)
        # for spotify interaction
        self.interactions = interactions
        # row positioning
        center = position_app()
        self.move(center)
        self.standard_row_height, self.small_row_height = [57, 47]
        self.resize(540, self.standard_row_height * 8)  # keep this, fixes weird bug
        # theming and style
        self.theme = {"dark": {"bg": "#191414", "text": "#B3B3B3"},
                      "light": {"bg": "#B3B3B3", "text": "#191414"}}
        self.active_theme = self.theme["dark"]
        self.setStyleSheet(f"QWidget {{background: {self.active_theme['bg']};}}")
        self.setWindowTitle('Spotlightify')
        self.setWindowOpacity(0.9)
        # global styling
        QtGui.QFontDatabase.addApplicationFont(f"{ROOT_DIR}/src/assets/fonts/SFProDisplay-Light.ttf")
        self.custom_font = QtGui.QFont(QtGui.QFontDatabase.applicationFontFamilies(0)[0] + " light")
        # For cycling through previous commands
        self.previous_commands = [""]
        self.command_position = 0
        # needed for adding suggestion rows
        self.rows = [0] * 6
        self.current_num_of_rows = 0  # used to find the default command to execute
        # needed to exit the application
        self.exit = 0
        self.setWindowFlags(QtCore.Qt.FramelessWindowHint | QtCore.Qt.Tool | QtCore.Qt.WindowStaysOnTopHint)
        self.create_widgets()

    def create_widgets(self):
        self.resize(540, self.small_row_height + self.standard_row_height)  # makes up the height of the widget

        self.svgWidget = SvgButton(self, f"{ASSETS_DIR}/svg/spotify-logo.svg")
        self.svgWidget.clicked.connect(self.toggle_function_buttons)
        # svg logo layout
        self.svgWidget.setSize(39, 39)
        self.svgWidget.move(9, self.small_row_height + 9)

        self.textbox = QLineEdit(self)
        self.textbox.returnPressed.connect(self.textbox_return_pressed_handler)
        self.textbox.textChanged.connect(self.text_changed_handler)
        self.textbox.setFocusPolicy(QtCore.Qt.StrongFocus)
        self.textbox.move(51, self.small_row_height + 9)
        self.textbox.setPlaceholderText("Spotlightify Search")
        self.textbox.resize(481, 41)
        self.textbox.installEventFilter(self)
        self.textbox.setStyleSheet(f'''
                        QLineEdit 
                        {{
                            border: 0;
                            background: {self.active_theme["bg"]}; 
                            color: {self.active_theme["text"]};
                            font-size: 25px;
                            border-radius: 2px;
                            selection-background-color: #6f6f76;
                            padding-left: 6px;
                            padding-right: 6px;
                        }}''')
        self.textbox.setFont(self.custom_font)
        # add grouped widgets
        self.function_row = FunctionButtonsRow(self, self.interactions)
        self.function_row.move(0, 0)
        self.function_row.show()
        self.toggle_function_buttons()
        
        # Mac setting
        self.textbox.setAttribute(QtCore.Qt.WA_MacShowFocusRect, 0)

    def eventFilter(self, source, event):
        if event.type() == QtCore.QEvent.KeyPress and source in self.rows:
            if event.key() == QtCore.Qt.Key_Return and source.hasFocus():
                self.suggest_row_handler(source.command_dict)
        if (event.type() == QtCore.QEvent.FocusOut and
                source is self.textbox and not self.suggestion_has_focus() and not self.function_row.hasFocus()):
            self.hide()
            return True
            # return true here to bypass default behaviour
        return super(Ui, self).eventFilter(source, event)

    def suggestion_has_focus(self):
        for row in self.rows:
            if row != 0:
                if row.hasFocus():
                    return True

    def toggle_function_buttons(self):
        if not self.function_row.isHidden():
            self.resize(540, self.standard_row_height)
            self.svgWidget.move(9, 9)
            self.textbox.move(51, 9)
            self.move(self.x(), self.y() + 47)
            self.function_row.hide()
        else:
            self.resize(540, self.standard_row_height + self.small_row_height)
            self.svgWidget.move(9, self.small_row_height + 9)
            self.textbox.move(51, self.small_row_height + 9)
            self.move(self.x(), self.y() - 47)
            self.function_row.show()
        if self.textbox.text() != "":
            self.create_suggestion_widgets()

    def text_changed_handler(self):
        text = self.textbox.text()
        length = len(text)
        # this for loop resets tab the tab index for the suggestion rows
        for row in self.rows:
            if row != 0:
                row.setFocusPolicy(QtCore.Qt.StrongFocus)
                row.hide()
        if length > 0:
            self.create_suggestion_widgets()
        else:
            self.current_num_of_rows = 0
            if self.function_row.isHidden():
                self.resize(540, self.standard_row_height)
            else:
                self.resize(540, self.small_row_height + self.standard_row_height)

    def textbox_return_pressed_handler(self):
        self.store_previous_command()
        if self.current_num_of_rows != 0:
            self.suggest_row_handler(self.rows[0].command_dict)
        elif self.exit == 1:
            exit()
        else:
            self.textbox.clear()

    def store_previous_command(self):
        self.previous_commands[len(self.previous_commands) - 1] = self.textbox.text()
        self.previous_commands.append("")
        self.command_position = len(self.previous_commands) - 1

    def keyPressEvent(self, event):
        # code for going back through recently executed commands
        if event.key() == QtCore.Qt.Key_Up:
            length = len(self.previous_commands)
            if length - 1 >= self.command_position != 0:
                self.command_position -= 1
                self.textbox.setText(self.previous_commands[self.command_position])
        elif event.key() == QtCore.Qt.Key_Down:
            length = len(self.previous_commands)
            if length - 1 != self.command_position >= 0:
                self.command_position += 1
                self.textbox.setText(self.previous_commands[self.command_position])
        # hides self when escape is pressed
        elif event.key() == QtCore.Qt.Key_Escape:
            self.textbox.clear()
            self.hide()

    def add_row(self, row_num, command):
        if self.rows[row_num] != 0 and self.current_num_of_rows != 0:
            self.rows[row_num].setFocusPolicy(QtCore.Qt.NoFocus)
            self.rows[row_num].hide()
        self.rows[row_num] = SuggestRow(self, command)
        self.rows[row_num].clicked.connect(lambda: self.suggest_row_handler(command))
        self.rows[row_num].setFocusPolicy(QtCore.Qt.TabFocus)
        self.rows[row_num].installEventFilter(self)
        if self.function_row.isHidden():
            self.rows[row_num].move(0, self.standard_row_height * (1 + row_num))
        else:
            self.rows[row_num].move(0, self.standard_row_height * (1 + row_num) + self.small_row_height)
        self.rows[row_num].show()
        self.current_num_of_rows = row_num + 1

    def suggest_row_handler(self, command):
        if command["exe_on_return"] == 0:
            self.textbox.setText(command["prefix"][0])
            self.textbox.setFocus()
            self.textbox.deselect()  # deselects selected text as a result of focus
        else:
            self.store_previous_command()
            self.interactions.command_perform(command, self)
            self.textbox.clear()
            self.hide()

    def create_suggestion_widgets(self):
        term = self.textbox.text().strip().lower()
        matched_commands = self.interactions.command_match(term)
        length = len(matched_commands)
        self.dynamic_resize(length)
        if length != 0:
            for row in range(0, length):
                command = matched_commands[row]
                self.add_row(row, command)
        else:
            self.current_num_of_rows = 0

    def dynamic_resize(self, size):  # size is int between 1 and 6
        height = 57
        if 0 <= size <= 6:
            if self.function_row.isHidden():
                height = self.standard_row_height * (size + 1)
            else:
                height = self.standard_row_height * (size + 1) + self.small_row_height
        self.resize(540, height)


def position_app():
    coord = QDesktopWidget().availableGeometry().center()
    to_sub = QtCore.QPoint(270, 450)  # half the width of the application
    center = coord.__sub__(to_sub)
    return center


def exit_app(parent):
    parent.exit = 1
