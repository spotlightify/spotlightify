from PyQt5.QtWidgets import QDialog, QVBoxLayout, QDialogButtonBox, QWidget, QLabel, QLineEdit, QErrorMessage, \
    QMessageBox
from PyQt5.QtCore import Qt, QRect
from PyQt5.QtGui import QFont, QIcon

from caching.manager import CacheManager
from auth.config import config
from settings.themes import default_themes
from definitions import ASSETS_DIR
from os import sep, environ


class AuthUI(QDialog):
    def __init__(self):
        QDialog.__init__(self, None, Qt.WindowTitleHint)

        self.config = config

        self.isCanceled = True

        self.cfg = {
            "username": self.config.username,
            "client_id": self.config.client_id,
            "client_secret": self.config.client_secret,
            "redirect_uri": self.config.redirect_uri
        }

        self.setWindowModality(Qt.ApplicationModal)
        self.setFixedSize(450, 233)
        self.setWindowTitle("Spotlightify - Authentication")
        self.setWindowIcon(QIcon(f"{ASSETS_DIR}svg{sep}cog"))

        self.setStyleSheet(f"background-color: {default_themes['dark'].background}; color: {default_themes['dark'].foreground}")

        self.layout_widget = VerticalLayout(self)
        self.layout_widget.setGeometry(QRect(10, 10, 440, 160))

        self.layout_widget.add(InputField(label="Username", store=self.cfg, field="username"))
        self.layout_widget.add(
            InputField(label="Client ID", store=self.cfg, field="client_id", required_length=32))
        self.layout_widget.add(
            InputField(label="Client Secret", store=self.cfg, field="client_secret", required_length=32))
        self.layout_widget.add(
            InputField(label="Redirect URI", store=self.cfg, field="redirect_uri", max_length=100))

        self.buttonBox = QDialogButtonBox(self)
        self.buttonBox.setGeometry(QRect(10, 190, 300, 23))
        self.buttonBox.setStandardButtons(QDialogButtonBox.Cancel | QDialogButtonBox.Save)
        self.buttonBox.accepted.connect(self.save_changes)
        self.buttonBox.rejected.connect(self.close)

    def save_changes(self):
        widgets = self.layout_widget.children()
        if all([w.text_complete for w in widgets]):
            CacheManager.create_cache()  # Creates cache if it is missing (e.g. First time start up)
            self.config.set_all(self.cfg["username"], self.cfg["client_id"], self.cfg["client_secret"],
                                self.cfg["redirect_uri"])
            self.isCanceled = False
            self.close()
        else:
            QMessageBox.warning(self, "Error", "The fields below have not been filled in correctly:\n" +
                                 '\n'.join([w.label.text() for w in widgets if not w.text_complete]), QMessageBox.Ok)


class VerticalLayout(QWidget):
    def __init__(self, parent):
        QWidget.__init__(self, parent=parent)
        self.vertical_layout = QVBoxLayout(self)

    def add(self, widget: QWidget):
        self.vertical_layout.addWidget(widget)

    def children(self):
        return super(VerticalLayout, self).children()[1:]


class InputField(QWidget):
    def __init__(self, label: str, store: dict, field: str, max_length=32, required_length=1):
        QWidget.__init__(self)
        self.setFixedSize(400, 300)

        self.max_length = max_length
        self.required_length = required_length
        self.text_complete = False
        self.store = store
        self.field = field

        self.font = QFont()
        self.font.setFamily("SF Pro Display")
        self.font.setPointSize(11)

        self.label = QLabel(self)
        self.label.setGeometry(QRect(10, 5, 100, 30))
        self.label.setFont(self.font)
        self.label.setText(label)

        self.textbox = QLineEdit(self)
        self.textbox.setGeometry(QRect(110, 5, 290, 30))
        self.textbox.setFont(self.font)
        self.textbox.textChanged.connect(self.field_changed)
        self.textbox.setText(store[field])
        self.textbox.setMaxLength(max_length)

    def field_changed(self):
        text = self.textbox.text()

        self.store[self.field] = text

        if len(text) >= self.required_length:
            self.text_complete = True
            self.textbox.setStyleSheet("border: 1px solid #006600;")
        else:
            self.text_complete = False
            self.textbox.setStyleSheet("border: 1px solid #4d0000;")
