/*
  Warnings:

  - A unique constraint covering the columns `[phone]` on the table `BotSession` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `phone` to the `BotSession` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "BotSession" ADD COLUMN     "phone" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "BotSession_phone_key" ON "BotSession"("phone");
