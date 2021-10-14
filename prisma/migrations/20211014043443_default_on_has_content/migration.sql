-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Doc" (
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
    "versionId" TEXT NOT NULL,
    CONSTRAINT "Doc_versionId_fkey" FOREIGN KEY ("versionId") REFERENCES "Version" ("fullVersionOrBranch") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Doc" ("description", "disabled", "filePath", "hasContent", "hidden", "html", "id", "lang", "md", "order", "published", "siblingLinks", "title", "toc", "versionId") SELECT "description", "disabled", "filePath", "hasContent", "hidden", "html", "id", "lang", "md", "order", "published", "siblingLinks", "title", "toc", "versionId" FROM "Doc";
DROP TABLE "Doc";
ALTER TABLE "new_Doc" RENAME TO "Doc";
CREATE UNIQUE INDEX "Doc_filePath_versionId_lang_key" ON "Doc"("filePath", "versionId", "lang");
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
