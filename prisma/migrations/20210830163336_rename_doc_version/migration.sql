/*
  Warnings:

  - You are about to drop the column `fullVersionOrBranchId` on the `Doc` table. All the data in the column will be lost.
  - Added the required column `lang` to the `Doc` table without a default value. This is not possible if the table is not empty.
  - Added the required column `versionId` to the `Doc` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "Doc.filePath_fullVersionOrBranchId_unique";

-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Doc" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "filePath" TEXT NOT NULL,
    "md" TEXT NOT NULL,
    "html" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "order" INTEGER,
    "disabled" BOOLEAN NOT NULL DEFAULT false,
    "siblingLinks" BOOLEAN NOT NULL DEFAULT false,
    "published" TEXT,
    "description" TEXT,
    "lang" TEXT NOT NULL,
    "versionId" TEXT NOT NULL,
    FOREIGN KEY ("versionId") REFERENCES "Version" ("fullVersionOrBranch") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Doc" ("description", "disabled", "filePath", "html", "id", "md", "order", "published", "siblingLinks", "title") SELECT "description", "disabled", "filePath", "html", "id", "md", "order", "published", "siblingLinks", "title" FROM "Doc";
DROP TABLE "Doc";
ALTER TABLE "new_Doc" RENAME TO "Doc";
CREATE UNIQUE INDEX "Doc.filePath_versionId_lang_unique" ON "Doc"("filePath", "versionId", "lang");
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
