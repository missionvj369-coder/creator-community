CREATE TABLE site_settings (
  singleton INTEGER PRIMARY KEY CHECK(singleton=1),
  title TEXT NOT NULL DEFAULT 'Human Within',
  notice TEXT NOT NULL DEFAULT '',
  disabled TEXT NOT NULL DEFAULT '["support"]',
  amount TEXT NOT NULL DEFAULT '100',
  currency TEXT NOT NULL DEFAULT 'INR',
  revision INTEGER NOT NULL DEFAULT 0
);
INSERT INTO site_settings(singleton) VALUES (1);

CREATE TABLE media (
  id TEXT PRIMARY KEY,
  kind TEXT NOT NULL CHECK(kind IN ('music','video')),
  title TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  src TEXT NOT NULL,
  poster TEXT NOT NULL DEFAULT '',
  captions TEXT NOT NULL DEFAULT '',
  enabled INTEGER NOT NULL DEFAULT 1 CHECK(enabled IN (0,1)),
  position INTEGER NOT NULL DEFAULT 0,
  revision INTEGER NOT NULL DEFAULT 0
);
INSERT INTO media(id,kind,title,description,src,poster,position) VALUES
('curiosity','music','Curiosity','Harp and piano','/cinema/audio/curiosity.m4a','',10),
('invisible','music','Invisible','Bowed strings and glass','/cinema/audio/invisible.m4a','',20),
('atelier','music','Atelier','Warm keys and marimba','/cinema/audio/atelier.m4a','',30),
('welcome','video','Human Within · Welcome','The original welcome film','/videos/welcome-flow.mp4','/videos/intro-1.webp',10);

CREATE TABLE orders (
  id TEXT PRIMARY KEY,
  invoice_id TEXT NOT NULL UNIQUE,
  amount TEXT NOT NULL,
  currency TEXT NOT NULL,
  status TEXT NOT NULL CHECK(status IN ('pending','settled','expired','invalid')),
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX orders_created ON orders(created_at);
CREATE TABLE checkout_limits (bucket TEXT PRIMARY KEY, count INTEGER NOT NULL, expires_at INTEGER NOT NULL);
CREATE INDEX checkout_limits_expiry ON checkout_limits(expires_at);
CREATE TABLE audit_log (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  actor TEXT NOT NULL,
  action TEXT NOT NULL,
  target TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
