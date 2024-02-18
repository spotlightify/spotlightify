import path from 'path';
import sqlite3 from 'sqlite3';
import { Song } from './structs';

export class DatabaseQuery {
  private database: sqlite3.Database;

  constructor() {
    const dbPath = path.resolve(__dirname, '..', '..', '..', 'db', 'cache.db');
    this.database = new sqlite3.Database(dbPath);
  }

  querySongs(input: string): Promise<Song[]> {
    return new Promise((resolve, reject) => {
      this.database.serialize(() => {
        this.database.all<Song>(
          `SELECT * FROM Songs WHERE name LIKE ? LIMIT 20`,
          [`${input}%`],
          (err, rows) => {
            if (err) {
              reject(err);
            } else {
              resolve(rows as Song[]);
            }
          },
        );
      });
    });
  }

  // queryAlbums(): any[] {
  //   // Query the database for albums
  //   // Return an array of albums
  //   return this.database.query('SELECT * FROM albums');
  // }

  // queryPlaylists(): any[] {
  //   // Query the database for playlists
  //   // Return an array of playlists
  //   return this.database.query('SELECT * FROM playlists');
  // }

  // queryPodcasts(): any[] {
  //   // Query the database for podcasts
  //   // Return an array of podcasts
  //   return this.database.query('SELECT * FROM podcasts');
  // }
}

export default DatabaseQuery;
