/*
  Warnings:

  - You are about to drop the column `path` on the `Artist` table. All the data in the column will be lost.
  - You are about to drop the column `completePath` on the `Release` table. All the data in the column will be lost.

*/
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
    "coverReleaseId" INTEGER,
    CONSTRAINT "Artist_coverReleaseId_fkey" FOREIGN KEY ("coverReleaseId") REFERENCES "Release" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Artist" ("coverReleaseId", "createdAt", "entityType", "hash", "id", "name", "normalizedName", "updatedAt") SELECT "coverReleaseId", "createdAt", "entityType", "hash", "id", "name", "normalizedName", "updatedAt" FROM "Artist";
DROP TABLE "Artist";
ALTER TABLE "new_Artist" RENAME TO "Artist";
CREATE UNIQUE INDEX "Artist_hash_key" ON "Artist"("hash");
CREATE UNIQUE INDEX "Artist_coverReleaseId_key" ON "Artist"("coverReleaseId");
CREATE INDEX "Artist_hash_idx" ON "Artist"("hash");
CREATE TABLE "new_Release" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "entityType" TEXT NOT NULL DEFAULT 'release',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "title" TEXT NOT NULL,
    "normalizedTitle" TEXT NOT NULL DEFAULT '',
    "hash" TEXT NOT NULL,
    "path" TEXT NOT NULL DEFAULT '',
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
INSERT INTO "new_Release" ("artist_id", "colorInfo", "createdAt", "discNumber", "discTitle", "entityType", "hash", "hideOnHomepage", "id", "mainReleaseId", "normalizedTitle", "path", "title", "type", "updatedAt", "year") SELECT "artist_id", "colorInfo", "createdAt", "discNumber", "discTitle", "entityType", "hash", "hideOnHomepage", "id", "mainReleaseId", "normalizedTitle", "path", "title", "type", "updatedAt", "year" FROM "Release";
DROP TABLE "Release";
ALTER TABLE "new_Release" RENAME TO "Release";
CREATE UNIQUE INDEX "Release_hash_key" ON "Release"("hash");
CREATE UNIQUE INDEX "Release_path_key" ON "Release"("path");
CREATE INDEX "Release_hash_idx" ON "Release"("hash");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
