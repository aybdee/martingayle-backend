/*
  Warnings:

  - The primary key for the `BotSession` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `id` on the `BotSession` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "BotSession" DROP CONSTRAINT "BotSession_pkey",
DROP COLUMN "id",
ADD CONSTRAINT "BotSession_pkey" PRIMARY KEY ("phone");
