/*
  Warnings:

  - You are about to drop the `Playlist` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `_PlaylistToRelease` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "_PlaylistToRelease" DROP CONSTRAINT "_PlaylistToRelease_A_fkey";

-- DropForeignKey
ALTER TABLE "_PlaylistToRelease" DROP CONSTRAINT "_PlaylistToRelease_B_fkey";

-- AlterTable
ALTER TABLE "_ArtistToNote" ADD CONSTRAINT "_ArtistToNote_AB_pkey" PRIMARY KEY ("A", "B");

-- DropIndex
DROP INDEX "_ArtistToNote_AB_unique";

-- AlterTable
ALTER TABLE "_NoteToRelease" ADD CONSTRAINT "_NoteToRelease_AB_pkey" PRIMARY KEY ("A", "B");

-- DropIndex
DROP INDEX "_NoteToRelease_AB_unique";

-- DropTable
DROP TABLE "Playlist";

-- DropTable
DROP TABLE "_PlaylistToRelease";

-- CreateTable
CREATE TABLE "Collection" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "title" VARCHAR(255) NOT NULL,

    CONSTRAINT "Collection_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_CollectionToRelease" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL,

    CONSTRAINT "_CollectionToRelease_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "_CollectionToRelease_B_index" ON "_CollectionToRelease"("B");

-- AddForeignKey
ALTER TABLE "_CollectionToRelease" ADD CONSTRAINT "_CollectionToRelease_A_fkey" FOREIGN KEY ("A") REFERENCES "Collection"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_CollectionToRelease" ADD CONSTRAINT "_CollectionToRelease_B_fkey" FOREIGN KEY ("B") REFERENCES "Release"("id") ON DELETE CASCADE ON UPDATE CASCADE;
