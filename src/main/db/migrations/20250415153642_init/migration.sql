-- CreateTable
CREATE TABLE "_AppearsInRelease" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL,

    CONSTRAINT "_AppearsInRelease_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "_AppearsInRelease_B_index" ON "_AppearsInRelease"("B");

-- AddForeignKey
ALTER TABLE "_AppearsInRelease" ADD CONSTRAINT "_AppearsInRelease_A_fkey" FOREIGN KEY ("A") REFERENCES "Artist"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_AppearsInRelease" ADD CONSTRAINT "_AppearsInRelease_B_fkey" FOREIGN KEY ("B") REFERENCES "Release"("id") ON DELETE CASCADE ON UPDATE CASCADE;
