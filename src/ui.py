import os
from PyQt5.QtWidgets import QApplication, QWidget, QDesktopWidget, QLineEdit, QPushButton
from PyQt5 import QtCore, QtGui, QtSvg
from src.widgets import FunctionButtonsRow, SuggestRow
from src import interactions


class Ui(QWidget):
    QApplication.setAttribute(QtCore.Qt.AA_EnableHighDpiScaling, True)  # enable highdpi scaling
    QApplication.setAttribute(QtCore.Qt.AA_UseHighDpiPixmaps, True)  # use highdpi icon-base

    def __init__(self, parent=None):
        QWidget.__init__(self, parent)
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
        self.custom_font = QtGui.QFont("SF Pro Display Light")
        # For cycling through previous commands
        self.previous_commands = [""]
        self.command_position = 0
        # needed for adding suggestion rows
        self.rows = [0] * 6
        self.current_num_of_rows = 0  # used to find the default command to execute
        # needed to exit the application
        self.exit = 0
        self.create_widgets()
        self.setWindowFlags(QtCore.Qt.FramelessWindowHint | QtCore.Qt.Tool)

    def create_widgets(self):
        self.resize(540, self.small_row_height + self.standard_row_height)  # makes up the height of the widget

        # add grouped widgets
        self.function_row = FunctionButtonsRow(self)
        self.function_row.move(0, 0)
        self.function_row.show()

        self.svgWidget = QtSvg.QSvgWidget('assets/svg/spotify-logo.svg', self)
        # svg logo layout
        self.svgWidget.resize(39, 39)
        self.svgWidget.move(9, self.small_row_height + 9)

        self.textbox = QLineEdit(self)
        self.textbox.returnPressed.connect(self.textbox_return_pressed_handler)
        self.textbox.textChanged.connect(self.text_changed_handler)
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

    def eventFilter(self, source, event):
        if event.type() == QtCore.QEvent.KeyPress and source in self.rows:
            if event.key() == QtCore.Qt.Key_Return and source.hasFocus():
                self.suggest_row_handler(source.command_dict)
        if (event.type() == QtCore.QEvent.FocusOut and
                source is self.textbox and not self.suggestion_has_focus()):
            self.hide()
            return True
            # return true here to bypass default behaviour
        return super(Ui, self).eventFilter(source, event)

    def suggestion_has_focus(self):
        for row in self.rows:
            if row !=0:
                if row.hasFocus():
                    return True

    def text_changed_handler(self):
        text = self.textbox.text()
        length = len(text)
        if length > 0:
            self.create_suggestion_widgets()
        else:
            self.current_num_of_rows = 0
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

    def add_row(self, row_num, command):
        if self.rows[row_num] != 0 and self.current_num_of_rows != 0:
            self.rows[row_num].setFocusPolicy(QtCore.Qt.NoFocus)
            self.rows[row_num].hide()
        self.rows[row_num] = SuggestRow(self, command)
        self.rows[row_num].clicked.connect(lambda: self.suggest_row_handler(command))
        self.rows[row_num].installEventFilter(self)
        self.rows[row_num].move(0, 57 * (row_num + 1) + 47)
        self.rows[row_num].show()
        self.current_num_of_rows = row_num + 1

    def suggest_row_handler(self, command):
        if command["exe_on_return"] == 0:
            self.textbox.setText(command["prefix"][0])
            self.textbox.setFocus()
            self.textbox.deselect()  # deselects selected text as a result of focus
        else:
            self.store_previous_command()
            interactions.perform_command(command, self)
            self.textbox.clear()

    def create_suggestion_widgets(self):
        # this for loop resets tab the tab index for the suggestion rows
        for row in self.rows:
            if row != 0:
                row.setFocusPolicy(QtCore.Qt.NoFocus)
                row.hide()
        term = self.textbox.text().strip().lower()
        matched_commands = interactions.command_match(term)
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
        if 1 <= size <= 6:
            height = self.standard_row_height * (size + 1) + self.small_row_height
        else:
            height = self.standard_row_height + self.small_row_height
        self.resize(540, height)


def position_app():
    coord = QDesktopWidget().availableGeometry().center()
    to_sub = QtCore.QPoint(270, 300)  # half the width of the application
    center = coord.__sub__(to_sub)
    return center


def exit_app(parent):
    parent.exit = 1
