const Database = require('better-sqlite3');

// create the file if it doesn't exist
const db = new Database('FramingIT!.db');

// Better R/W performance
db.pragma('journal_mode = WAL');
// Enables F.K.
db.pragma('foreign_keys = ON');

db.exec(`
  CREATE TABLE IF NOT EXISTS TimeFrames (
    TFid        INTEGER PRIMARY KEY AUTOINCREMENT,
    title       TEXT    NOT NULL,
    description TEXT
  );

  CREATE TABLE IF NOT EXISTS Events (
    Eid         INTEGER PRIMARY KEY AUTOINCREMENT,
    TFid        INTEGER NOT NULL,

    title       TEXT    NOT NULL,
    description TEXT,

    imgPath     TEXT,

    -- 0 = single date / 1 = period
    isPeriod    INTEGER NOT NULL,

    isSBCE      BOOLEAN NOT NULL,
    sYY         INTEGER NOT NULL,
    sMM         INTEGER,
    sDD         INTEGER,

    isEBCE      BOOLEAN NOT NULL,
    eYY         INTEGER,
    eMM         INTEGER,
    eDD         INTEGER,

    FOREIGN KEY (TFid) REFERENCES TimeFrames(TFid) ON DELETE CASCADE,

    -- boolean flags
    CHECK(isSBCE IN (0,1)),
    CHECK(isEBCE IN (0,1)),
    CHECK(isPeriod IN (0,1)),

    -- month/day ranges
    CHECK(sMM IS NULL OR (sMM BETWEEN 1 AND 12)),
    CHECK(eMM IS NULL OR (eMM BETWEEN 1 AND 12)),
    CHECK(sDD IS NULL OR (sDD BETWEEN 1 AND 31)),
    CHECK(eDD IS NULL OR (eDD BETWEEN 1 AND 31)),

    -- presence rules
    CHECK(sDD IS NULL OR sMM IS NOT NULL),
    CHECK(eDD IS NULL OR eMM IS NOT NULL),
    CHECK(isPeriod = 0 OR eYY IS NOT NULL),

    -- year sign rules
    CHECK( (isSBCE = 1 AND sYY > 0) OR (isSBCE = 0 AND sYY >= 1) ),
    CHECK( eYY IS NULL OR ((isEBCE = 1 AND eYY > 0) OR (isEBCE = 0 AND eYY >= 1)) ),

    -- ordering using astronomical conversion
    CHECK(
      isPeriod = 0
      OR (
        (CASE WHEN isEBCE = 1 THEN -(eYY - 1) ELSE eYY END)
          >
        (CASE WHEN isSBCE = 1 THEN -(sYY - 1) ELSE sYY END)
        OR (
          (CASE WHEN isEBCE = 1 THEN -(eYY - 1) ELSE eYY END)
            =
          (CASE WHEN isSBCE = 1 THEN -(sYY - 1) ELSE sYY END)
          AND (
            eMM IS NULL OR sMM IS NULL OR eMM > sMM
            OR (
              eMM = sMM
              AND (eDD IS NULL OR sDD IS NULL OR eDD >= sDD)
            )
          )
        )
      )
    )
  );
`);

module.exports = db;