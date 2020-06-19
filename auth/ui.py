from PyQt5.QtWidgets import QDialog, QVBoxLayout, QDialogButtonBox, QWidget, QLabel, QLineEdit, QApplication
from PyQt5.QtCore import Qt, QRect
from PyQt5.QtGui import QFont

from auth import Config


class AuthUI(QDialog):
    def __init__(self, config: Config):
        QDialog.__init__(self)

        self.config = config

        self.cfg = {
            "username": config.username,
            "client_id": config.client_id,
            "client_secret": config.client_secret,
            "redirect_uri": config.redirect_uri
        }

        self.setWindowModality(Qt.ApplicationModal)
        self.setFixedSize(340, 233)

        self.layout_widget = VerticalLayout(self)
        self.layout_widget.setGeometry(QRect(10, 10, 300, 160))

        self.layout_widget.add(InputField(label="Username", store=self.cfg, field="username", set_=self.field_changed))
        self.layout_widget.add(InputField(label="Client ID", store=self.cfg, field="client_id", set_=self.field_changed))
        self.layout_widget.add(InputField(label="Client Secret", store=self.cfg, field="client_secret", set_=self.field_changed))
        self.layout_widget.add(InputField(label="Redirect URI", store=self.cfg, field="redirect_uri", set_=self.field_changed))

        self.buttonBox = QDialogButtonBox(self)
        self.buttonBox.setGeometry(QRect(10, 190, 300, 23))
        self.buttonBox.setStandardButtons(QDialogButtonBox.Cancel | QDialogButtonBox.Ok)
        self.buttonBox.accepted.connect(self.save_changes)
        self.buttonBox.rejected.connect(self.hide)

    def field_changed(self, field, value):
        self.cfg[field] = value

    def save_changes(self):
        self.config.username = self.cfg["username"]
        self.config.client_id = self.cfg["client_id"]
        self.config.client_secret = self.cfg["client_secret"]
        self.config.redirect_uri = self.cfg["redirect_uri"]


class VerticalLayout(QWidget):
    def __init__(self, parent):
        QWidget.__init__(self, parent=parent)
        self.vertical_layout = QVBoxLayout(self)

    def add(self, widget: QWidget):
        self.vertical_layout.addWidget(widget)


class InputField(QWidget):
    def __init__(self, label: str, store: dict, field: str, set_: classmethod):  #
        QWidget.__init__(self)
        self.setFixedSize(300, 40)

        self.font = QFont()
        self.font.setFamily("SF Pro Display")
        self.font.setPointSize(11)

        self.label = QLabel(self)
        self.label.setGeometry(QRect(10, 5, 100, 30))
        self.label.setFont(self.font)
        self.label.setText(label)

        self.textbox = QLineEdit(self)
        self.textbox.setGeometry(QRect(110, 5, 180, 30))
        self.textbox.setFont(self.font)
        self.textbox.setText(store[field])
        self.textbox.setFrame(False)
        self.textbox.textChanged.connect(lambda val: set_(field, val))


app = QApplication([])
ui = AuthUI(Config())
ui.show()
app.exec_()
