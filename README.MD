# Spotlightify
Spotlightify is a GUI based application designed to allow users to quickly interact with the Spotify Desktop application across Windows, Linux and macOS.

## Prerequisites
- Spotify Premium Account (We have not yet tested this with a free account so feel free to)
- Python 3.7 or later
- A Spotify App must also be created, the instructions follow:
    1. Open the Spotify Developer Dashboard <a href="https://developer.spotify.com/dashboard/login" target="_blank">here</a> and login using your Spotify account credentials.
    2. Click the "CREATE AN APP" button.
    3. Name the application "Spotlightify", leave the description blank and select "Desktop App" from the checkboxes. Click "NEXT".
    4. Respond with "No" to the question "Are you developing a commercial integration?".
    5. Tick all boxes and click "SUBMIT".
    6. Now on the dashboard, click "EDIT SETTINGS".
    7. Under the title "Redirect URIs" enter: "http://localhost:8080", hit "ADD" and then at the bottom, hit "SAVE".
    8. That is the App set up, keep the dashboard webpage open as we will need `Client ID` and `Client Secret` from it later on.

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
### Linking the Spotify App
On the Spotify App that you have created, take the values of `Client ID` and `Client Secret` and respectively assign their values to the variables inside of the `config.py` file in the project's root directory. To make sure the correct username is entered into the `username` variable, go to <a href="https://www.spotify.com/us/account/overview/" target="_blank">this link</a>, get your exact username string and paste it into the `username` variable. This is the setup complete, you can now run `app.py` to start the application and the shortcut `ctrl + space` to invoke the GUI.

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
- <a href="https://spotipy.readthedocs.io/en/2.12.0/" target="_blank">Spotipy</a> - A Spotify API wrapper for Python
- <a href="https://www.riverbankcomputing.com/software/pyqt/" target="_blank">PyQt5</a> - A cross platform GUI framework for Python

## Contributing
Join us on <a href="https://discord.gg/6sMm8qr" target="_blank">discord</a> to discuss how to contribute to the project.
