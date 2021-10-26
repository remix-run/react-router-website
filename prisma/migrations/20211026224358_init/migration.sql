-- CreateTable
CREATE TABLE "GitHubRef" (
    "ref" TEXT NOT NULL,
    "releaseNotes" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "GitHubRef_pkey" PRIMARY KEY ("ref")
);

-- CreateTable
CREATE TABLE "Doc" (
    "id" TEXT NOT NULL,
    "filePath" TEXT NOT NULL,
    "md" TEXT NOT NULL,
    "html" TEXT NOT NULL,
    "lang" TEXT NOT NULL,
    "hasContent" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "title" TEXT NOT NULL,
    "order" INTEGER,
    "disabled" BOOLEAN NOT NULL DEFAULT false,
    "siblingLinks" BOOLEAN NOT NULL DEFAULT false,
    "published" TEXT,
    "description" TEXT,
    "hidden" BOOLEAN NOT NULL DEFAULT false,
    "toc" BOOLEAN NOT NULL DEFAULT true,
    "githubRefId" TEXT NOT NULL,

    CONSTRAINT "Doc_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Doc_filePath_githubRefId_lang_key" ON "Doc"("filePath", "githubRefId", "lang");

-- AddForeignKey
ALTER TABLE "Doc" ADD CONSTRAINT "Doc_githubRefId_fkey" FOREIGN KEY ("githubRefId") REFERENCES "GitHubRef"("ref") ON DELETE CASCADE ON UPDATE CASCADE;
