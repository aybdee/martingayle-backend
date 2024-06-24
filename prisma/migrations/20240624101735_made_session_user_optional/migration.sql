-- DropForeignKey
ALTER TABLE "BetLogs" DROP CONSTRAINT "BetLogs_userId_fkey";

-- AlterTable
ALTER TABLE "BetLogs" ALTER COLUMN "userId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "BetLogs" ADD CONSTRAINT "BetLogs_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
