-- CreateTable
CREATE TABLE "Version" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "fullVersionOrBranch" TEXT NOT NULL,
    "versionHeadOrBranch" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "Doc" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "filePath" TEXT NOT NULL,
    "md" TEXT NOT NULL,
    "html" TEXT NOT NULL,
    "fullVersionOrBranchId" TEXT NOT NULL,
    FOREIGN KEY ("fullVersionOrBranchId") REFERENCES "Version" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "Version.fullVersionOrBranch_unique" ON "Version"("fullVersionOrBranch");

-- CreateIndex
CREATE UNIQUE INDEX "Doc.filePath_fullVersionOrBranchId_unique" ON "Doc"("filePath", "fullVersionOrBranchId");
