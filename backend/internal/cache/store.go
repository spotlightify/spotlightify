package cache

import (
	"database/sql"
	"log"

	_ "github.com/mattn/go-sqlite3"

	m "github.com/spotlightify/spotlightify/internal/model"
)

var CacheManager = NewCacheManager()

type cacheManager struct {
	db *sql.DB
}

func (c *cacheManager) GetTrack(key string) ([]m.Track, error) {
	var songs []m.Track
	rows, err := c.db.Query("SELECT * FROM Songs WHERE name LIKE ? LIMIT 20", "%"+key+"%")
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	for rows.Next() {
		var song m.Track
		err := rows.Scan(&song.ID, &song.Name, &song.ArtistNames, &song.SpotifyID, &song.Length, &song.Image)
		if err != nil {
			return nil, err
		}
		songs = append(songs, song)
	}

	// Check for errors from iterating over rows
	if err = rows.Err(); err != nil {
		return nil, err
	}

	return songs, nil
}

func NewCacheManager() *cacheManager {
	db, err := sql.Open("sqlite3", "../db/cache.db")
	if err != nil {
		log.Fatal(err)
	}

	return &cacheManager{
		db: db,
	}
}
