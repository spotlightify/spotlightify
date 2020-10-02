from settings.themes import Theme


class Preferences:
    """
    Pref file for settings such as theming, and other general settings.
    """

    def __init__(self, theme):
        self.themeConfig = theme

    def ThemeConfig(self, background, foreground, accent):
        """ Fetches Theme settings  """
        themeGen = Theme(background, foreground, accent)
        return themeGen



