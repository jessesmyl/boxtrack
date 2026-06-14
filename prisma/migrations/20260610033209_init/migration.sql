-- CreateTable
CREATE TABLE "Move" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "clientName" TEXT NOT NULL,
    "fromAddr" TEXT,
    "toAddr" TEXT,
    "homeSize" TEXT,
    "moveDate" DATETIME,
    "status" TEXT NOT NULL DEFAULT 'active',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "Box" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "moveId" TEXT NOT NULL,
    "label" INTEGER NOT NULL,
    "room" TEXT,
    "category" TEXT,
    "fragile" BOOLEAN NOT NULL DEFAULT false,
    "fillLevel" TEXT,
    "notes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Box_moveId_fkey" FOREIGN KEY ("moveId") REFERENCES "Move" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Photo" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "boxId" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Photo_boxId_fkey" FOREIGN KEY ("boxId") REFERENCES "Box" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "Box_moveId_label_key" ON "Box"("moveId", "label");
