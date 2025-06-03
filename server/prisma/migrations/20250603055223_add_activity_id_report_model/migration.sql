/*
  Warnings:

  - Added the required column `activityId` to the `reports` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `reports` ADD COLUMN `activityId` INTEGER NOT NULL;

-- AddForeignKey
ALTER TABLE `reports` ADD CONSTRAINT `reports_activityId_fkey` FOREIGN KEY (`activityId`) REFERENCES `activities`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
