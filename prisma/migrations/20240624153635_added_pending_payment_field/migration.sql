-- AlterTable
ALTER TABLE "User" ADD COLUMN     "pendingExpiry" TIMESTAMP(3),
ADD COLUMN     "pendingPayment" DOUBLE PRECISION NOT NULL DEFAULT 0;
