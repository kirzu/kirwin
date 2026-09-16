-- AlterTable
ALTER TABLE "BlogPost" ADD COLUMN "imageUrl" TEXT;
ALTER TABLE "BlogPost" ADD COLUMN "rating" INTEGER;
ALTER TABLE "BlogPost" ADD COLUMN "youtubeUrl" TEXT;

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Availability" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "courseId" TEXT NOT NULL,
    "startDateTime" DATETIME NOT NULL,
    "endDateTime" DATETIME NOT NULL,
    "capacity" INTEGER NOT NULL,
    "bookedCount" INTEGER NOT NULL DEFAULT 0,
    "isAvailable" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Availability_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "Course" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Availability" ("bookedCount", "capacity", "courseId", "createdAt", "endDateTime", "id", "isAvailable", "startDateTime", "updatedAt") SELECT "bookedCount", "capacity", "courseId", "createdAt", "endDateTime", "id", "isAvailable", "startDateTime", "updatedAt" FROM "Availability";
DROP TABLE "Availability";
ALTER TABLE "new_Availability" RENAME TO "Availability";
CREATE INDEX "Availability_courseId_startDateTime_idx" ON "Availability"("courseId", "startDateTime");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
