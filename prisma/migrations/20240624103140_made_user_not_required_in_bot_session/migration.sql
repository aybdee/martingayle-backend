/*
  Warnings:

  - Made the column `userId` on table `BetLogs` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "BetLogs" DROP CONSTRAINT "BetLogs_userId_fkey";

-- DropForeignKey
ALTER TABLE "BotSession" DROP CONSTRAINT "BotSession_userId_fkey";

-- AlterTable
ALTER TABLE "BetLogs" ALTER COLUMN "userId" SET NOT NULL;

-- AlterTable
ALTER TABLE "BotSession" ALTER COLUMN "userId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "BotSession" ADD CONSTRAINT "BotSession_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BetLogs" ADD CONSTRAINT "BetLogs_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
