-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Artist" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "entityType" TEXT NOT NULL DEFAULT 'artist',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "name" TEXT NOT NULL,
    "normalizedName" TEXT NOT NULL DEFAULT '',
    "hash" TEXT NOT NULL,
    "path" TEXT NOT NULL DEFAULT '',
    "coverReleaseId" INTEGER,
    CONSTRAINT "Artist_coverReleaseId_fkey" FOREIGN KEY ("coverReleaseId") REFERENCES "Release" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Artist" ("coverReleaseId", "createdAt", "entityType", "hash", "id", "name", "normalizedName", "path", "updatedAt") SELECT "coverReleaseId", "createdAt", "entityType", "hash", "id", "name", "normalizedName", "path", "updatedAt" FROM "Artist";
DROP TABLE "Artist";
ALTER TABLE "new_Artist" RENAME TO "Artist";
CREATE UNIQUE INDEX "Artist_hash_key" ON "Artist"("hash");
CREATE UNIQUE INDEX "Artist_coverReleaseId_key" ON "Artist"("coverReleaseId");
CREATE INDEX "Artist_hash_idx" ON "Artist"("hash");
CREATE TABLE "new_Collection" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "entityType" TEXT NOT NULL DEFAULT 'collection',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "title" TEXT NOT NULL,
    "coverReleaseId" INTEGER,
    CONSTRAINT "Collection_coverReleaseId_fkey" FOREIGN KEY ("coverReleaseId") REFERENCES "Release" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Collection" ("coverReleaseId", "createdAt", "entityType", "id", "title", "updatedAt") SELECT "coverReleaseId", "createdAt", "entityType", "id", "title", "updatedAt" FROM "Collection";
DROP TABLE "Collection";
ALTER TABLE "new_Collection" RENAME TO "Collection";
CREATE TABLE "new_Group" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "entityType" TEXT NOT NULL DEFAULT 'group',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "coverArtistId" INTEGER,
    CONSTRAINT "Group_coverArtistId_fkey" FOREIGN KEY ("coverArtistId") REFERENCES "Artist" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Group" ("coverArtistId", "createdAt", "description", "entityType", "id", "title", "updatedAt") SELECT "coverArtistId", "createdAt", "description", "entityType", "id", "title", "updatedAt" FROM "Group";
DROP TABLE "Group";
ALTER TABLE "new_Group" RENAME TO "Group";
CREATE TABLE "new_Release" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "entityType" TEXT NOT NULL DEFAULT 'release',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "title" TEXT NOT NULL,
    "normalizedTitle" TEXT NOT NULL DEFAULT '',
    "hash" TEXT NOT NULL,
    "path" TEXT NOT NULL DEFAULT '',
    "completePath" TEXT NOT NULL DEFAULT '',
    "colorInfo" JSONB,
    "type" TEXT NOT NULL DEFAULT 'Album',
    "year" INTEGER,
    "discTitle" TEXT,
    "discNumber" INTEGER DEFAULT 1,
    "hideOnHomepage" BOOLEAN DEFAULT false,
    "artist_id" INTEGER NOT NULL,
    "mainReleaseId" INTEGER,
    CONSTRAINT "Release_mainReleaseId_fkey" FOREIGN KEY ("mainReleaseId") REFERENCES "Release" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Release_artist_id_fkey" FOREIGN KEY ("artist_id") REFERENCES "Artist" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Release" ("artist_id", "colorInfo", "completePath", "createdAt", "discNumber", "discTitle", "entityType", "hash", "hideOnHomepage", "id", "mainReleaseId", "normalizedTitle", "path", "title", "type", "updatedAt", "year") SELECT "artist_id", "colorInfo", "completePath", "createdAt", "discNumber", "discTitle", "entityType", "hash", "hideOnHomepage", "id", "mainReleaseId", "normalizedTitle", "path", "title", "type", "updatedAt", "year" FROM "Release";
DROP TABLE "Release";
ALTER TABLE "new_Release" RENAME TO "Release";
CREATE UNIQUE INDEX "Release_hash_key" ON "Release"("hash");
CREATE INDEX "Release_hash_idx" ON "Release"("hash");
CREATE TABLE "new_Track" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "entityType" TEXT NOT NULL DEFAULT 'track',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "title" TEXT NOT NULL,
    "normalizedTitle" TEXT NOT NULL DEFAULT '',
    "hash" TEXT NOT NULL,
    "path" TEXT NOT NULL,
    "duration" INTEGER NOT NULL,
    "releaseId" INTEGER NOT NULL,
    "position" INTEGER NOT NULL,
    "trackArtist" TEXT DEFAULT '',
    "normalizedTrackArtist" TEXT DEFAULT '',
    CONSTRAINT "Track_releaseId_fkey" FOREIGN KEY ("releaseId") REFERENCES "Release" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Track" ("createdAt", "duration", "entityType", "hash", "id", "normalizedTitle", "normalizedTrackArtist", "path", "position", "releaseId", "title", "trackArtist", "updatedAt") SELECT "createdAt", "duration", "entityType", "hash", "id", "normalizedTitle", "normalizedTrackArtist", "path", "position", "releaseId", "title", "trackArtist", "updatedAt" FROM "Track";
DROP TABLE "Track";
ALTER TABLE "new_Track" RENAME TO "Track";
CREATE UNIQUE INDEX "Track_hash_key" ON "Track"("hash");
CREATE INDEX "Track_hash_idx" ON "Track"("hash");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
