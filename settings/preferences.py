import sys
from settings.themes import Theme
from auth import Config, AuthUI
from PyQt5.QtWidgets import QApplication


class Preferences:
    """
    Pref file for settings such as theming, and other general settings.
    """

    def __init__(self):

        self.theme_gen = ''
        self.config = Config

    def themeConfig(self, background, foreground, accent):
        """ Fetches Theme settings  """
        theme_gen = Theme(background, foreground, accent)
        return theme_gen

    def runPreChecks(self):
        """
        Does a pre check and if
        details haven't been set,
        it'll invoke the Auth UI
        so user can enter neccessary
        details
        """

        # Validation dependencies
        config_gen = self.config()

        if not config_gen.is_valid():
            app = QApplication([])
            app.setQuitOnLastWindowClosed(True)
            auth = AuthUI()

        while not config_gen.is_valid():
            auth.show()
            app.exec_()
            if auth.isCanceled:
                sys.exit()
