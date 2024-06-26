/*
  Warnings:

  - The primary key for the `BotSession` table will be changed. If it partially fails, the table could be left without primary key constraint.

*/
-- AlterTable
ALTER TABLE "BotSession" DROP CONSTRAINT "BotSession_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ADD CONSTRAINT "BotSession_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "BotSession_id_seq";
