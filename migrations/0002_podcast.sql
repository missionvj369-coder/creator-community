CREATE TABLE media_with_podcasts (
  id TEXT PRIMARY KEY,
  kind TEXT NOT NULL CHECK(kind IN ('music','video','podcast')),
  title TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  src TEXT NOT NULL,
  poster TEXT NOT NULL DEFAULT '',
  captions TEXT NOT NULL DEFAULT '',
  enabled INTEGER NOT NULL DEFAULT 1 CHECK(enabled IN (0,1)),
  position INTEGER NOT NULL DEFAULT 0,
  revision INTEGER NOT NULL DEFAULT 0
);
INSERT INTO media_with_podcasts SELECT id,kind,title,description,src,poster,captions,enabled,position,revision FROM media;
DROP TABLE media;
ALTER TABLE media_with_podcasts RENAME TO media;
INSERT INTO media(id,kind,title,description,src,position) VALUES
('podcast-welcome','podcast','Welcome to Human Within','A short spoken introduction','/cinema/audio/home-voice.m4a',10),
('podcast-journey','podcast','The Human Journey','A short spoken introduction to the collection','/cinema/audio/journey-voice.m4a',20),
('podcast-clarity','podcast','Clarity','A short spoken introduction to the practice','/cinema/audio/clarity-voice.m4a',30);
