from PyQt5.QtWidgets import QApplication
from auth.ui import AuthUI
from auth.config import Config

cfg = Config()
app = QApplication([])
window = AuthUI()
window.show() # IMPORTANT!!!!! Windows are hidden by default.

# Start the event loop.
window.exec_()
