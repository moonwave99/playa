/*
  Warnings:

  - You are about to drop the `Album` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Track` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "ReleaseType" AS ENUM ('Album', 'EP', 'Single', 'Compilation', 'Bootleg', 'Various', 'Tribute');

-- DropForeignKey
ALTER TABLE "Album" DROP CONSTRAINT "Album_artist_id_fkey";

-- DropForeignKey
ALTER TABLE "Track" DROP CONSTRAINT "Track_album_id_fkey";

-- DropTable
DROP TABLE "Album";

-- DropTable
DROP TABLE "Track";

-- DropEnum
DROP TYPE "Type";

-- CreateTable
CREATE TABLE "Release" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "title" VARCHAR(255) NOT NULL,
    "hash" VARCHAR(255) NOT NULL,
    "path" VARCHAR(255) NOT NULL,
    "type" "ReleaseType" NOT NULL DEFAULT 'Album',
    "year" INTEGER,
    "disc" INTEGER DEFAULT 1,
    "total_discs" INTEGER DEFAULT 1,
    "artist_id" INTEGER NOT NULL,

    CONSTRAINT "Release_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Release" ADD CONSTRAINT "Release_artist_id_fkey" FOREIGN KEY ("artist_id") REFERENCES "Artist"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
