/*
  Warnings:

  - Added the required column `releaseNotes` to the `Version` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Version" (
    "fullVersionOrBranch" TEXT NOT NULL PRIMARY KEY,
    "versionHeadOrBranch" TEXT NOT NULL,
    "releaseNotes" TEXT NOT NULL
);
INSERT INTO "new_Version" ("fullVersionOrBranch", "versionHeadOrBranch") SELECT "fullVersionOrBranch", "versionHeadOrBranch" FROM "Version";
DROP TABLE "Version";
ALTER TABLE "new_Version" RENAME TO "Version";
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;

-- RedefineIndex
DROP INDEX "Doc.filePath_versionId_lang_unique";
CREATE UNIQUE INDEX "Doc_filePath_versionId_lang_key" ON "Doc"("filePath", "versionId", "lang");
