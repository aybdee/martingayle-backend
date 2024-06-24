-- CreateEnum
CREATE TYPE "BotState" AS ENUM ('ACTIVE', 'INACTIVE');

-- AlterTable
ALTER TABLE "BotSession" ADD COLUMN     "state" "BotState" NOT NULL DEFAULT 'INACTIVE';
