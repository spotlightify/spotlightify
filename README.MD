# Spotlightify
Spotlightify is a GUI based application designed to allow users to quickly interact with the Spotify Desktop application across Windows, Linux and macOS.

## Prerequisites
- Python 3.7 or later
- A Spotify App must also be created, the instructions follow:
    1. Open the Spotify Developer Dashboard ([here](https://developer.spotify.com/dashboard/login)) and login using your Spotify account credentials.
    2. Click the "CREATE AN APP" button.
    3. Name the application "Spotlightify", leave the description blank and select "Desktop App" from the checkboxes. Click "NEXT".
    4. Respond with "No" to the question "Are you developing a commercial integration?"
    5. Tick all boxes and click "SUBMIT"

## Installing Dependencies
Creating a Python virtual environment inside of the Spotlightify project folder and installing project dependencies:
### Windows
```
cd path\to\spotlightify-root
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
``` 

### MacOS/Linux
```
cd path/to/spotlightify-root
python -m venv venv
. venv/bin/activate
pip install -r requirements.txt
```

## Usage
Run `app.py` to start the application. The GUI is activated by using the shortcut `ctrl + space`. Here is the current list of available functions:
```
| Name     | Description                      | Prefix        | Parameter     |
|----------|----------------------------------|---------------|---------------|
| Play     | Plays a song                     | play          | song name     |
| Queue    | Queues a song                    | queue         | song name     |
| Playlist | Plays a saved/followed playlist  | playlist      | playlist name |
| Liked    | Plays saved/liked music          | liked         | None          |
| Volume   | Changes music volume             | volume        | 1 - 100       |
| Go to    | Seeks a position in a song       | goto          | e.g. 1:24     |
| Resume   | Resumes music playback           | resume, start | None          |
| Skip     | Skips the current song           | skip, next    | None          |
| Previous | Plays pervious song              | previous      | None          |
| Pause    | Pauses music playback            | pause         | None          |
| Shuffle  | Toggles shuffle playback         | shuffle       | None          |
| Device   | Select device for music playback | device        | None          |
| Exit     | Exits the application            | exit          | None          |
```

## Built With
- [Spotipy](https://spotipy.readthedocs.io/en/2.12.0/) - A Spotify API wrapper for Python
- [PyQt5](https://www.riverbankcomputing.com/software/pyqt/) - A cross platform GUI framework for Python

## Contributing
Join us on [discord](https://discord.gg/6sMm8qr) to discuss how to contribute to the project.
