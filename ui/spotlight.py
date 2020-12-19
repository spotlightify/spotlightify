from os import sep
from PyQt5.QtWidgets import QApplication, QWidget, QDesktopWidget, QLineEdit
from PyQt5 import QtCore, QtGui

from spotlight.suggestions.menu import MenuSuggestion
from spotlight.handler import CommandHandler
from ui.widgets import FunctionButtonsRow, SuggestRow, SvgButton
from definitions import ASSETS_DIR
from spotipy import Spotify
from settings import default_themes

from caching import SongQueue


class SpotlightUI(QWidget):
    QApplication.setAttribute(QtCore.Qt.AA_EnableHighDpiScaling, True)  # enable highdpi scaling
    QApplication.setAttribute(QtCore.Qt.AA_UseHighDpiPixmaps, True)  # use highdpi icon-base

    def __init__(self, sp: Spotify, song_queue: SongQueue, parent=None):
        QWidget.__init__(self, parent)
        # for spotify interaction
        self.command_handler = CommandHandler(sp, song_queue)
        self.sp = sp
        # row positioning
        self.move(center_app())
        self.standard_row_height, self.small_row_height = [57, 47]
        self.resize(540, self.standard_row_height * 8)  # keep this, fixes weird bug
        # theming and style
        self.active_theme = default_themes["dark"]  # TODO Use Properties Class to get theme when implemented
        self.setStyleSheet(f"QWidget {{background: {self.active_theme.background};}}")
        self.setWindowTitle('Spotlightify')
        self.setWindowOpacity(0.9)
        # global styling
        self.custom_font = QtGui.QFont("SF Pro Display Light")  # TODO Replace with properties class reference when implemented
        # needed for adding suggestion rows
        self.rows = [QWidget() for i in range(0, 7)]
        self.current_num_of_rows = 0  # used to find the default command to executed
        # set window flags
        self.setWindowFlags(QtCore.Qt.FramelessWindowHint | QtCore.Qt.Tool | QtCore.Qt.WindowStaysOnTopHint)
        # for checking if shift is held in
        self.shift_in = False
        # create additional widgets
        self.create_widgets()

    def create_widgets(self):
        self.resize(540, self.small_row_height + self.standard_row_height)  # makes up the height of the widget

        self.svgWidget = SvgButton(self, f"{ASSETS_DIR}svg{sep}spotify-logo.svg")
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
                            background: {self.active_theme.background};
                            color: {self.active_theme.foreground};
                            font-size: 25px;
                            border-radius: 2px;
                            selection-background-color: #6f6f76;
                            padding-left: 6px;
                            padding-right: 6px;
                        }}''')
        self.textbox.setFont(self.custom_font)
        # add grouped widgets
        self.function_row = FunctionButtonsRow(self, self.sp)
        self.function_row.move(0, 0)
        self.function_row.show()
        self.toggle_function_buttons()

        # Mac setting
        self.textbox.setAttribute(QtCore.Qt.WA_MacShowFocusRect, 0)

    def eventFilter(self, source, event):
        def hide():
            self.textbox.clear()
            self.hide()
            return True
        if event.type() == QtCore.QEvent.KeyPress and event.key() == QtCore.Qt.Key_Shift:
            self.shift_in = True
            for row in self.rows:
                row.show_option_icon() if row.isVisible() else None
        if event.type() == QtCore.QEvent.KeyRelease and event.key() == QtCore.Qt.Key_Shift:
            self.shift_in = False
            for row in self.rows:
                row.hide_option_icon() if row.isVisible() else None
        if event.type() == QtCore.QEvent.KeyPress and event.key() == QtCore.Qt.Key_Down and source == self.textbox:
            self.focusNextChild()
        if event.type() == QtCore.QEvent.KeyPress and event.key() == QtCore.Qt.Key_Up and source == self.textbox:
            self.focusPreviousChild()
        if event.type() == QtCore.QEvent.KeyPress and source in self.rows:
            if event.key() == QtCore.Qt.Key_Return and source.hasFocus():
                self.suggestion_exe_handler(source.suggestion)
        if event.type() == QtCore.QEvent.KeyPress and event.key() == QtCore.Qt.Key_Escape:
            hide()
        if (event.type() == QtCore.QEvent.FocusOut and not any(w.hasFocus() for w in self.children())):  # hides if not focused
            hide()
            # return true here to bypass default behaviour
        return super(SpotlightUI, self).eventFilter(source, event)

    def suggestion_has_focus(self):
        for row in self.rows:
            if row.isVisible():
                if row.hasFocus():
                    return True
        return False

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
        self.refresh_visible_items()

    def refresh_visible_items(self, hide_all_items=False):
        if not hide_all_items:
            text = self.textbox.text()
        else:
            text = ""
        length = len(text)
        # this for loop resets the tab index for the suggestion rows
        for row in self.rows:
            if row.isVisible():
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
        if self.current_num_of_rows != 0:
            self.suggestion_exe_handler(self.rows[0].suggestion)
        else:
            self.textbox.clear()

    def add_row(self, index, suggestion):
        self.rows[index].deleteLater()
        self.rows[index] = SuggestRow(self, suggestion)
        self.rows[index].clicked.connect(lambda: self.suggestion_exe_handler(suggestion))
        self.rows[index].setFocusPolicy(QtCore.Qt.TabFocus)
        self.rows[index].installEventFilter(self)
        if self.function_row.isHidden():
            self.rows[index].move(0, self.standard_row_height * (1 + index))
        else:
            self.rows[index].move(0, self.standard_row_height * (1 + index) + self.small_row_height)
        self.rows[index].show()
        self.current_num_of_rows = index + 1

    def suggestion_exe_handler(self, suggestion):
        if suggestion.setting == "fill":
            self.textbox.setText(suggestion.fill_str)
            self.textbox.setFocus()
            self.textbox.deselect()  # deselects selected text as a result of focus
        elif self.shift_in and hasattr(suggestion, "option_suggestions"):
            self.refresh_visible_items(hide_all_items=True)
            self.show_suggestion_widgets(suggestion.option_suggestions)
            self.textbox.setFocus()
            self.textbox.deselect()  # deselects selected text as a result of focus
        elif isinstance(suggestion, MenuSuggestion) or suggestion.setting == "menu":
            self.refresh_visible_items(hide_all_items=True)
            self.textbox.setText(suggestion.fill_str) if suggestion.setting == "menu_fill" else None
            suggestion.refresh_menu_suggestions()
            self.show_suggestion_widgets(suggestion.menu_suggestions)
            self.textbox.setFocus()
            self.textbox.deselect()  # deselects selected text as a result of focus
        elif suggestion.setting == "none":
            return
        else:
            self.command_handler.execute_function(suggestion)
            self.textbox.clear()
            self.hide()

    def create_suggestion_widgets(self):
        term = self.textbox.text().strip().lower()
        matched_suggestions = self.command_handler.get_command_suggestions(term)
        self.show_suggestion_widgets(matched_suggestions)

    def show_suggestion_widgets(self, suggestion_list: list):
        length = len(suggestion_list)
        self.dynamic_resize(length)
        if length != 0:
            for row in range(0, length):
                suggestion = suggestion_list[row] # changes to dictionary form
                self.add_row(row, suggestion)
        else:
            self.current_num_of_rows = 0

    def dynamic_resize(self, size):  # size is int between 0 and 6
        height = 57
        if 0 <= size <= 6:
            if self.function_row.isHidden():
                height = self.standard_row_height * (size + 1)
            else:
                height = self.standard_row_height * (size + 1) + self.small_row_height
        self.resize(540, height)


def center_app():
    sizeObject = QDesktopWidget().screenGeometry(-1)
    height = sizeObject.height()
    coord = QDesktopWidget().availableGeometry().center()
    to_sub = QtCore.QPoint(270, height / 3)
    center = coord.__sub__(to_sub)
    return center
