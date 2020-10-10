import sys
from settings.themes import Theme
from auth import Config, AuthUI
from PyQt5.QtWidgets import QApplication


class Preferences_Meta(type):
    """ Meta class for the Preferences Class.. """
    _instances = {}

    def __call__(cls, *args, **kwargs):
        """
        Possible changes to the value of the `__init__` argument do not affect
        the returned instance.
        """
        if cls not in cls._instances:
            instance = super().__call__(*args, **kwargs)
            cls._instances[cls] = instance
        return cls._instances[cls]


class Preferences(metaclass=Preferences_Meta):
    """
    Pref file for settings such as theming, and other general settings.
    """

    @classmethod
    def themeConfig(cls, background, foreground, accent):
        """ Fetches Theme settings  """
        theme_gen = Theme(background, foreground, accent)
        return theme_gen

    @classmethod
    def run_prechecks(cls):
        """
        Does a pre check and if
        details haven't been set,
        it'll invoke the Auth UI
        so user can enter neccessary
        details
        """

        # Validation dependencies
        config_gen = Config()

        if not config_gen.is_valid():
            app = QApplication([])
            app.setQuitOnLastWindowClosed(False)
            auth = AuthUI()

        while not config_gen.is_valid():
            auth.show()
            app.exec_()
            if auth.isCanceled:
                sys.exit()

