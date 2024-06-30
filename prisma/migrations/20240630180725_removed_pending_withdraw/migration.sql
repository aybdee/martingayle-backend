/*
  Warnings:

  - You are about to drop the column `pendingWithdraw` on the `StatsProfile` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "BotSession_phone_key";

-- AlterTable
ALTER TABLE "StatsProfile" DROP COLUMN "pendingWithdraw";
