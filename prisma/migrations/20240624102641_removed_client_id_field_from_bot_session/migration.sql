/*
  Warnings:

  - You are about to drop the column `clientId` on the `BotSession` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "BotSession_clientId_key";

-- AlterTable
ALTER TABLE "BotSession" DROP COLUMN "clientId";
