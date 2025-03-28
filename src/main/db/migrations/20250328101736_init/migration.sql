/*
  Warnings:

  - You are about to drop the `Note` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `_ArtistToNote` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `_NoteToRelease` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "_ArtistToNote" DROP CONSTRAINT "_ArtistToNote_A_fkey";

-- DropForeignKey
ALTER TABLE "_ArtistToNote" DROP CONSTRAINT "_ArtistToNote_B_fkey";

-- DropForeignKey
ALTER TABLE "_NoteToRelease" DROP CONSTRAINT "_NoteToRelease_A_fkey";

-- DropForeignKey
ALTER TABLE "_NoteToRelease" DROP CONSTRAINT "_NoteToRelease_B_fkey";

-- DropTable
DROP TABLE "Note";

-- DropTable
DROP TABLE "_ArtistToNote";

-- DropTable
DROP TABLE "_NoteToRelease";
