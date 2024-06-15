package model

type Track struct {
	ID          int    `db:"id" json:"id"`
	Name        string `db:"name" json:"name"`
	ArtistNames string `db:"artist_names" json:"artist_names"`
	SpotifyID   string `db:"spotify_id" json:"spotify_id"`
	Length      string `db:"length" json:"length"`
	Image       string `db:"image" json:"image"`
}
