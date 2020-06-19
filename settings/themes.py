class Theme(object):
    def __init__(self, background: str, foreground: str, accent: str):
        self._background = background
        self._foreground = foreground
        self._accent = accent

    @property
    def background(self):
        return self._background

    @background.setter
    def background(self, value):
        self._background = value

    @property
    def foreground(self):
        return self._foreground

    @foreground.setter
    def foreground(self, value):
        self._foreground = value

    @property
    def accent(self):
        return self._accent

    @accent.setter
    def accent(self, value):
        self._accent = value


default_themes = {
    "dark": Theme("#191414", "#B3B3B3", "#332929"),
    "light": Theme("#B3B3B3", "#191414", "#332929")
}
