-- AlterTable
-- Rename and reshape Availability table columns to match new spec.
-- SQLite does not support renaming columns in older versions, so we add
-- new columns, copy data, then drop the old columns.

-- Step 1: Add the new columns with safe defaults so existing rows are valid.
ALTER TABLE "Availability" ADD COLUMN "startDateTime" DATETIME NOT NULL DEFAULT '1970-01-01 00:00:00';
ALTER TABLE "Availability" ADD COLUMN "endDateTime" DATETIME NOT NULL DEFAULT '1970-01-01 00:00:00';
ALTER TABLE "Availability" ADD COLUMN "capacity" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "Availability" ADD COLUMN "bookedCount" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "Availability" ADD COLUMN "isAvailable" BOOLEAN NOT NULL DEFAULT true;

-- Step 2: Copy data from old columns to new columns.
UPDATE "Availability" SET
  "startDateTime" = "startTime",
  "endDateTime" = "endTime",
  "capacity" = "maxSlots",
  "bookedCount" = "bookedSlots";

-- Step 3: Drop the old indexes (they will be replaced).
DROP INDEX IF EXISTS "Availability_startTime_idx";
DROP INDEX IF EXISTS "Availability_courseId_idx";

-- Step 4: Drop the legacy columns now that data has been migrated.
ALTER TABLE "Availability" DROP COLUMN "startTime";
ALTER TABLE "Availability" DROP COLUMN "endTime";
ALTER TABLE "Availability" DROP COLUMN "maxSlots";
ALTER TABLE "Availability" DROP COLUMN "bookedSlots";

-- Step 5: Add the new composite index required by the schema.
CREATE INDEX "Availability_courseId_startDateTime_idx" ON "Availability"("courseId", "startDateTime");
