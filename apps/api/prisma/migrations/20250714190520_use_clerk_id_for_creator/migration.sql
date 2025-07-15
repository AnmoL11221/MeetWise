/*
  Warnings:

  - You are about to drop the `ActionItem` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "ActionItem" DROP CONSTRAINT "ActionItem_assigneeId_fkey";

-- DropForeignKey
ALTER TABLE "ActionItem" DROP CONSTRAINT "ActionItem_meetingId_fkey";

-- DropForeignKey
ALTER TABLE "Meeting" DROP CONSTRAINT "Meeting_creatorId_fkey";

-- DropTable
DROP TABLE "ActionItem";

-- DropEnum
DROP TYPE "Priority";
