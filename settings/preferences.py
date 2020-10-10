import sys
from settings.themes import Theme
from auth import config, AuthUI
from PyQt5.QtWidgets import QApplication

class Preferences():
    """Pref file for settings such as theming, and other general settings."""

    __instance__ = None

    def __init__(self):
        self._config = config

        if Preferences.__instance__ is None:
            Preferences.__instance__ = self

        else:
            raise Exception("Another Preferences class cannot be created... \n\n")



    def themeConfig(self, background, foreground, accent):
        """ Fetches Theme settings  """
        theme_gen = Theme(background, foreground, accent)
        return theme_gen


    def run_prechecks(self):
        """
        Does a pre check and if
        details haven't been set,
        it'll invoke the Auth UI
        so user can enter neccessary
        details
        """

        # Validation dependencies

        if not self._config.is_valid():
            app = QApplication([])
            app.setQuitOnLastWindowClosed(True)
            auth = AuthUI()


        while not self._config.is_valid():
            auth.show()
            app.exec_()
            if auth.isCanceled:
                sys.exit()








