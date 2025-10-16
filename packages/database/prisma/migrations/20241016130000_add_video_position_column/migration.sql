-- AlterTable: add explicit ordering for course videos
ALTER TABLE "Videos"
ADD COLUMN "position" INTEGER NOT NULL DEFAULT 0;
