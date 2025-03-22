/*
  Warnings:

  - Added the required column `path` to the `Album` table without a default value. This is not possible if the table is not empty.
  - Added the required column `path` to the `Track` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Album" ADD COLUMN     "path" VARCHAR(255) NOT NULL,
ADD COLUMN     "year" INTEGER,
ALTER COLUMN "disc" DROP NOT NULL,
ALTER COLUMN "total_discs" DROP NOT NULL;

-- AlterTable
ALTER TABLE "Track" ADD COLUMN     "path" VARCHAR(255) NOT NULL,
ALTER COLUMN "number" DROP NOT NULL;
