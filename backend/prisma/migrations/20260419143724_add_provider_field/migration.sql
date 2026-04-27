-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "password" TEXT,
    "googleId" TEXT,
    "name" TEXT,
    "avatar" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "lastLogin" DATETIME,
    "role" TEXT NOT NULL DEFAULT 'user',
    "provider" TEXT NOT NULL DEFAULT 'local',
    "isActive" BOOLEAN NOT NULL DEFAULT true
);
INSERT INTO "new_User" ("avatar", "createdAt", "email", "googleId", "id", "isActive", "lastLogin", "name", "password", "role", "updatedAt") SELECT "avatar", "createdAt", "email", "googleId", "id", "isActive", "lastLogin", "name", "password", "role", "updatedAt" FROM "User";
DROP TABLE "User";
ALTER TABLE "new_User" RENAME TO "User";
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
CREATE UNIQUE INDEX "User_googleId_key" ON "User"("googleId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
