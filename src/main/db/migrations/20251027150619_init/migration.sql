-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Release" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "entityType" TEXT NOT NULL DEFAULT 'Release',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "title" TEXT NOT NULL,
    "normalizedTitle" TEXT NOT NULL DEFAULT '',
    "hash" TEXT NOT NULL,
    "path" TEXT NOT NULL DEFAULT '',
    "completePath" TEXT NOT NULL DEFAULT '',
    "colorInfo" JSONB DEFAULT null,
    "type" TEXT NOT NULL DEFAULT 'Album',
    "year" INTEGER,
    "discTitle" TEXT,
    "discNumber" INTEGER DEFAULT 1,
    "hideOnHomepage" BOOLEAN DEFAULT false,
    "artist_id" INTEGER NOT NULL,
    "mainReleaseId" INTEGER,
    CONSTRAINT "Release_artist_id_fkey" FOREIGN KEY ("artist_id") REFERENCES "Artist" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Release_mainReleaseId_fkey" FOREIGN KEY ("mainReleaseId") REFERENCES "Release" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Release" ("artist_id", "colorInfo", "completePath", "createdAt", "discNumber", "discTitle", "entityType", "hash", "hideOnHomepage", "id", "mainReleaseId", "normalizedTitle", "path", "title", "type", "updatedAt", "year") SELECT "artist_id", "colorInfo", "completePath", "createdAt", "discNumber", "discTitle", "entityType", "hash", "hideOnHomepage", "id", "mainReleaseId", "normalizedTitle", "path", "title", "type", "updatedAt", "year" FROM "Release";
DROP TABLE "Release";
ALTER TABLE "new_Release" RENAME TO "Release";
CREATE UNIQUE INDEX "Release_hash_key" ON "Release"("hash");
CREATE INDEX "Release_hash_idx" ON "Release"("hash");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
