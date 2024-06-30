/*
  Warnings:

  - You are about to drop the column `state` on the `BotSession` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "BotSession" DROP COLUMN "state";

-- DropEnum
DROP TYPE "BotState";
