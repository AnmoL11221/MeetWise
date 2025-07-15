-- CreateEnum
CREATE TYPE "Priority" AS ENUM ('LOW', 'MEDIUM', 'HIGH');

-- AlterTable
ALTER TABLE "ActionItem" ADD COLUMN     "priority" "Priority" NOT NULL DEFAULT 'MEDIUM';
