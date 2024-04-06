DELETE FROM Songs
WHERE ROWID NOT IN (
    SELECT MIN(ROWID)
    FROM Songs
    GROUP BY name, artist_names, image
);
