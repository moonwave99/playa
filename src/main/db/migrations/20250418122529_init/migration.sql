-- AlterTable
ALTER TABLE "Artist" ADD COLUMN     "normalizedName" VARCHAR(255) NOT NULL DEFAULT '';

-- AlterTable
ALTER TABLE "Release" ADD COLUMN     "normalizedTitle" VARCHAR(255) NOT NULL DEFAULT '';

-- AlterTable
ALTER TABLE "Track" ADD COLUMN     "normalizedTitle" VARCHAR(255) NOT NULL DEFAULT '';
