-- CreateTable
CREATE TABLE "Track" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "title" VARCHAR(255) NOT NULL,
    "hash" VARCHAR(16) NOT NULL,
    "path" VARCHAR(255) NOT NULL,
    "duration" INTEGER NOT NULL,
    "releaseId" INTEGER,

    CONSTRAINT "Track_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Track_hash_key" ON "Track"("hash");

-- CreateIndex
CREATE INDEX "Track_hash_idx" ON "Track" USING HASH ("hash");

-- AddForeignKey
ALTER TABLE "Track" ADD CONSTRAINT "Track_releaseId_fkey" FOREIGN KEY ("releaseId") REFERENCES "Release"("id") ON DELETE SET NULL ON UPDATE CASCADE;
