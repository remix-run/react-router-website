-- CreateTable
CREATE TABLE "GitHubRef" (
    "ref" TEXT NOT NULL PRIMARY KEY,
    "releaseNotes" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "Doc" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "filePath" TEXT NOT NULL,
    "md" TEXT NOT NULL,
    "html" TEXT NOT NULL,
    "lang" TEXT NOT NULL,
    "hasContent" BOOLEAN NOT NULL DEFAULT false,
    "title" TEXT NOT NULL,
    "order" INTEGER,
    "disabled" BOOLEAN NOT NULL DEFAULT false,
    "siblingLinks" BOOLEAN NOT NULL DEFAULT false,
    "published" TEXT,
    "description" TEXT,
    "hidden" BOOLEAN NOT NULL DEFAULT false,
    "toc" BOOLEAN NOT NULL DEFAULT true,
    "githubRefId" TEXT NOT NULL,
    CONSTRAINT "Doc_githubRefId_fkey" FOREIGN KEY ("githubRefId") REFERENCES "GitHubRef" ("ref") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "Doc_filePath_githubRefId_lang_key" ON "Doc"("filePath", "githubRefId", "lang");
