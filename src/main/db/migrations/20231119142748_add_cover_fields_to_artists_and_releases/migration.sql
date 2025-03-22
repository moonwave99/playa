-- AlterTable
ALTER TABLE "Artist" ADD COLUMN     "cover" VARCHAR(255) NOT NULL DEFAULT '';

-- AlterTable
ALTER TABLE "Release" ADD COLUMN     "cover" VARCHAR(255) NOT NULL DEFAULT '';
