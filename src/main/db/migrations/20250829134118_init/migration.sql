-- CreateTable
CREATE TABLE "Artist" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "name" TEXT NOT NULL,
    "normalizedName" TEXT NOT NULL DEFAULT '',
    "hash" TEXT NOT NULL,
    "path" TEXT NOT NULL DEFAULT '',
    "coverReleaseId" INTEGER,
    CONSTRAINT "Artist_coverReleaseId_fkey" FOREIGN KEY ("coverReleaseId") REFERENCES "Release" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Release" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
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

-- CreateTable
CREATE TABLE "Track" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
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

-- CreateTable
CREATE TABLE "Collection" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "title" TEXT NOT NULL,
    "coverReleaseId" INTEGER,
    CONSTRAINT "Collection_coverReleaseId_fkey" FOREIGN KEY ("coverReleaseId") REFERENCES "Release" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Group" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "coverArtistId" INTEGER,
    CONSTRAINT "Group_coverArtistId_fkey" FOREIGN KEY ("coverArtistId") REFERENCES "Artist" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "_RelatedArtists" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL,
    CONSTRAINT "_RelatedArtists_A_fkey" FOREIGN KEY ("A") REFERENCES "Artist" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "_RelatedArtists_B_fkey" FOREIGN KEY ("B") REFERENCES "Artist" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "_GroupToArtist" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL,
    CONSTRAINT "_GroupToArtist_A_fkey" FOREIGN KEY ("A") REFERENCES "Artist" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "_GroupToArtist_B_fkey" FOREIGN KEY ("B") REFERENCES "Group" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "_AppearsInRelease" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL,
    CONSTRAINT "_AppearsInRelease_A_fkey" FOREIGN KEY ("A") REFERENCES "Artist" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "_AppearsInRelease_B_fkey" FOREIGN KEY ("B") REFERENCES "Release" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "_CollectionToRelease" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL,
    CONSTRAINT "_CollectionToRelease_A_fkey" FOREIGN KEY ("A") REFERENCES "Collection" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "_CollectionToRelease_B_fkey" FOREIGN KEY ("B") REFERENCES "Release" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "Artist_hash_key" ON "Artist"("hash");

-- CreateIndex
CREATE UNIQUE INDEX "Artist_coverReleaseId_key" ON "Artist"("coverReleaseId");

-- CreateIndex
CREATE INDEX "Artist_hash_idx" ON "Artist"("hash");

-- CreateIndex
CREATE INDEX "Release_hash_idx" ON "Release"("hash");

-- CreateIndex
CREATE UNIQUE INDEX "Track_hash_key" ON "Track"("hash");

-- CreateIndex
CREATE INDEX "Track_hash_idx" ON "Track"("hash");

-- CreateIndex
CREATE UNIQUE INDEX "_RelatedArtists_AB_unique" ON "_RelatedArtists"("A", "B");

-- CreateIndex
CREATE INDEX "_RelatedArtists_B_index" ON "_RelatedArtists"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_GroupToArtist_AB_unique" ON "_GroupToArtist"("A", "B");

-- CreateIndex
CREATE INDEX "_GroupToArtist_B_index" ON "_GroupToArtist"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_AppearsInRelease_AB_unique" ON "_AppearsInRelease"("A", "B");

-- CreateIndex
CREATE INDEX "_AppearsInRelease_B_index" ON "_AppearsInRelease"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_CollectionToRelease_AB_unique" ON "_CollectionToRelease"("A", "B");

-- CreateIndex
CREATE INDEX "_CollectionToRelease_B_index" ON "_CollectionToRelease"("B");
