/*
  Warnings:

  - The primary key for the `Version` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `id` on the `Version` table. All the data in the column will be lost.
  - Added the required column `title` to the `Doc` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "Version.fullVersionOrBranch_unique";

-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Version" (
    "fullVersionOrBranch" TEXT NOT NULL PRIMARY KEY,
    "versionHeadOrBranch" TEXT NOT NULL
);
INSERT INTO "new_Version" ("fullVersionOrBranch", "versionHeadOrBranch") SELECT "fullVersionOrBranch", "versionHeadOrBranch" FROM "Version";
DROP TABLE "Version";
ALTER TABLE "new_Version" RENAME TO "Version";
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
    "fullVersionOrBranchId" TEXT NOT NULL,
    FOREIGN KEY ("fullVersionOrBranchId") REFERENCES "Version" ("fullVersionOrBranch") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Doc" ("filePath", "fullVersionOrBranchId", "html", "id", "md") SELECT "filePath", "fullVersionOrBranchId", "html", "id", "md" FROM "Doc";
DROP TABLE "Doc";
ALTER TABLE "new_Doc" RENAME TO "Doc";
CREATE UNIQUE INDEX "Doc.filePath_fullVersionOrBranchId_unique" ON "Doc"("filePath", "fullVersionOrBranchId");
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
