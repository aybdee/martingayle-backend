-- CreateEnum
CREATE TYPE "TransactionType" AS ENUM ('BOT_SESION', 'BOT_SESSION_PAYMENT', 'REFERRAL_INCOMING');

-- CreateEnum
CREATE TYPE "TransactionStatus" AS ENUM ('VERIFIED', 'PENDING', 'FAILED');

-- CreateTable
CREATE TABLE "TransactionLogs" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "type" "TransactionType" NOT NULL,
    "status" "TransactionStatus" NOT NULL,

    CONSTRAINT "TransactionLogs_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "TransactionLogs" ADD CONSTRAINT "TransactionLogs_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
