-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Move" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "clientName" TEXT NOT NULL,
    "market" TEXT NOT NULL DEFAULT 'ON',
    "fromAddr" TEXT,
    "toAddr" TEXT,
    "homeSize" TEXT,
    "moveDate" DATETIME,
    "status" TEXT NOT NULL DEFAULT 'active',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
INSERT INTO "new_Move" ("clientName", "createdAt", "fromAddr", "homeSize", "id", "moveDate", "status", "toAddr") SELECT "clientName", "createdAt", "fromAddr", "homeSize", "id", "moveDate", "status", "toAddr" FROM "Move";
DROP TABLE "Move";
ALTER TABLE "new_Move" RENAME TO "Move";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
