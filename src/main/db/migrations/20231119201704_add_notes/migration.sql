-- CreateTable
CREATE TABLE "Note" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "title" VARCHAR(255) NOT NULL,
    "content" TEXT NOT NULL,

    CONSTRAINT "Note_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_ArtistToNote" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateTable
CREATE TABLE "_NoteToRelease" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "_ArtistToNote_AB_unique" ON "_ArtistToNote"("A", "B");

-- CreateIndex
CREATE INDEX "_ArtistToNote_B_index" ON "_ArtistToNote"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_NoteToRelease_AB_unique" ON "_NoteToRelease"("A", "B");

-- CreateIndex
CREATE INDEX "_NoteToRelease_B_index" ON "_NoteToRelease"("B");

-- AddForeignKey
ALTER TABLE "_ArtistToNote" ADD CONSTRAINT "_ArtistToNote_A_fkey" FOREIGN KEY ("A") REFERENCES "Artist"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ArtistToNote" ADD CONSTRAINT "_ArtistToNote_B_fkey" FOREIGN KEY ("B") REFERENCES "Note"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_NoteToRelease" ADD CONSTRAINT "_NoteToRelease_A_fkey" FOREIGN KEY ("A") REFERENCES "Note"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_NoteToRelease" ADD CONSTRAINT "_NoteToRelease_B_fkey" FOREIGN KEY ("B") REFERENCES "Release"("id") ON DELETE CASCADE ON UPDATE CASCADE;
