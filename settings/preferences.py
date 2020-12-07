from settings.themes import Theme
from auth import config


class Preferences:
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





