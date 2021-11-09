/*
  Warnings:

  - Added the required column `sourceFilePath` to the `Doc` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Doc" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "filePath" TEXT NOT NULL,
    "sourceFilePath" TEXT NOT NULL,
    "md" TEXT NOT NULL,
    "html" TEXT NOT NULL,
    "lang" TEXT NOT NULL,
    "hasContent" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
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
INSERT INTO "new_Doc" ("createdAt", "description", "disabled", "filePath", "githubRefId", "hasContent", "hidden", "html", "id", "lang", "md", "order", "published", "siblingLinks", "title", "toc", "updatedAt") SELECT "createdAt", "description", "disabled", "filePath", "githubRefId", "hasContent", "hidden", "html", "id", "lang", "md", "order", "published", "siblingLinks", "title", "toc", "updatedAt" FROM "Doc";
DROP TABLE "Doc";
ALTER TABLE "new_Doc" RENAME TO "Doc";
CREATE UNIQUE INDEX "Doc_filePath_githubRefId_lang_key" ON "Doc"("filePath", "githubRefId", "lang");
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
