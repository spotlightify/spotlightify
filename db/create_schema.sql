-- Songs Table
CREATE TABLE Songs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name CHAR(200) NOT NULL,
    spotify_id CHAR(200) NOT NULL,
    length CHAR(10) NOT NULL,
    image CHAR(50) NOT NULL
);

-- Artists Table
CREATE TABLE Artists (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name CHAR(200) NOT NULL,
    spotify_id CHAR(200) NOT NULL,
    image CHAR(50) NOT NULL
);

-- SongArtists Table (Associative table for many-to-many relationship between Songs and Artists)
CREATE TABLE SongArtists (
    song_id INTEGER NOT NULL,
    artist_id INTEGER NOT NULL,
    FOREIGN KEY (song_id) REFERENCES Songs(id) ON DELETE CASCADE,
    FOREIGN KEY (artist_id) REFERENCES Artists(id) ON DELETE CASCADE,
    PRIMARY KEY (song_id, artist_id)
);

-- Playlists Table
CREATE TABLE Playlists (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name CHAR(200) NOT NULL,
    spotify_id CHAR(200) NOT NULL,
    image CHAR(50) NOT NULL,
    username CHAR(50) NOT NULL
);

-- Podcasts Table
CREATE TABLE Podcasts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name CHAR(200) NOT NULL,
    spotify_id CHAR(200) NOT NULL,
    image CHAR(50) NOT NULL
);
