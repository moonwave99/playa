-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Artist" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "entityType" TEXT NOT NULL DEFAULT 'Artist',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "name" TEXT NOT NULL,
    "normalizedName" TEXT NOT NULL DEFAULT '',
    "hash" TEXT NOT NULL,
    "path" TEXT NOT NULL DEFAULT '',
    "coverReleaseId" INTEGER,
    CONSTRAINT "Artist_coverReleaseId_fkey" FOREIGN KEY ("coverReleaseId") REFERENCES "Release" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Artist" ("coverReleaseId", "createdAt", "hash", "id", "name", "normalizedName", "path", "updatedAt") SELECT "coverReleaseId", "createdAt", "hash", "id", "name", "normalizedName", "path", "updatedAt" FROM "Artist";
DROP TABLE "Artist";
ALTER TABLE "new_Artist" RENAME TO "Artist";
CREATE UNIQUE INDEX "Artist_hash_key" ON "Artist"("hash");
CREATE UNIQUE INDEX "Artist_coverReleaseId_key" ON "Artist"("coverReleaseId");
CREATE INDEX "Artist_hash_idx" ON "Artist"("hash");
CREATE TABLE "new_Collection" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "entityType" TEXT NOT NULL DEFAULT 'Collection',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "title" TEXT NOT NULL,
    "coverReleaseId" INTEGER,
    CONSTRAINT "Collection_coverReleaseId_fkey" FOREIGN KEY ("coverReleaseId") REFERENCES "Release" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Collection" ("coverReleaseId", "createdAt", "id", "title", "updatedAt") SELECT "coverReleaseId", "createdAt", "id", "title", "updatedAt" FROM "Collection";
DROP TABLE "Collection";
ALTER TABLE "new_Collection" RENAME TO "Collection";
CREATE TABLE "new_Group" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "entityType" TEXT NOT NULL DEFAULT 'Group',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "coverArtistId" INTEGER,
    CONSTRAINT "Group_coverArtistId_fkey" FOREIGN KEY ("coverArtistId") REFERENCES "Artist" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Group" ("coverArtistId", "createdAt", "description", "id", "title", "updatedAt") SELECT "coverArtistId", "createdAt", "description", "id", "title", "updatedAt" FROM "Group";
DROP TABLE "Group";
ALTER TABLE "new_Group" RENAME TO "Group";
CREATE TABLE "new_Release" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "entityType" TEXT NOT NULL DEFAULT 'Release',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "title" TEXT NOT NULL,
    "normalizedTitle" TEXT NOT NULL DEFAULT '',
    "hash" TEXT NOT NULL,
    "path" TEXT NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'Album',
    "year" INTEGER,
    "discTitle" TEXT,
    "discNumber" INTEGER DEFAULT 1,
    "hideOnHomepage" BOOLEAN DEFAULT false,
    "artist_id" INTEGER NOT NULL,
    "mainReleaseId" INTEGER,
    CONSTRAINT "Release_artist_id_fkey" FOREIGN KEY ("artist_id") REFERENCES "Artist" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Release_mainReleaseId_fkey" FOREIGN KEY ("mainReleaseId") REFERENCES "Release" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Release" ("artist_id", "createdAt", "discNumber", "discTitle", "hash", "hideOnHomepage", "id", "mainReleaseId", "normalizedTitle", "path", "title", "type", "updatedAt", "year") SELECT "artist_id", "createdAt", "discNumber", "discTitle", "hash", "hideOnHomepage", "id", "mainReleaseId", "normalizedTitle", "path", "title", "type", "updatedAt", "year" FROM "Release";
DROP TABLE "Release";
ALTER TABLE "new_Release" RENAME TO "Release";
CREATE UNIQUE INDEX "Release_hash_key" ON "Release"("hash");
CREATE INDEX "Release_hash_idx" ON "Release"("hash");
CREATE TABLE "new_Track" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "entityType" TEXT NOT NULL DEFAULT 'Track',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "title" TEXT NOT NULL,
    "normalizedTitle" TEXT NOT NULL DEFAULT '',
    "hash" TEXT NOT NULL,
    "path" TEXT NOT NULL,
    "duration" INTEGER NOT NULL,
    "releaseId" INTEGER NOT NULL,
    "position" INTEGER NOT NULL,
    CONSTRAINT "Track_releaseId_fkey" FOREIGN KEY ("releaseId") REFERENCES "Release" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Track" ("createdAt", "duration", "hash", "id", "normalizedTitle", "path", "position", "releaseId", "title", "updatedAt") SELECT "createdAt", "duration", "hash", "id", "normalizedTitle", "path", "position", "releaseId", "title", "updatedAt" FROM "Track";
DROP TABLE "Track";
ALTER TABLE "new_Track" RENAME TO "Track";
CREATE UNIQUE INDEX "Track_hash_key" ON "Track"("hash");
CREATE INDEX "Track_hash_idx" ON "Track"("hash");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
