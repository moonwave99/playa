-- CreateTable
CREATE TABLE "_RelatedArtists" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL,

    CONSTRAINT "_RelatedArtists_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "_RelatedArtists_B_index" ON "_RelatedArtists"("B");

-- AddForeignKey
ALTER TABLE "_RelatedArtists" ADD CONSTRAINT "_RelatedArtists_A_fkey" FOREIGN KEY ("A") REFERENCES "Artist"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_RelatedArtists" ADD CONSTRAINT "_RelatedArtists_B_fkey" FOREIGN KEY ("B") REFERENCES "Artist"("id") ON DELETE CASCADE ON UPDATE CASCADE;
