-- CreateTable
CREATE TABLE "StatsProfile" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "dailyProfit" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "pendingSplit" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "pendingWithdraw" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "referralEarnings" DOUBLE PRECISION NOT NULL DEFAULT 0,

    CONSTRAINT "StatsProfile_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "StatsProfile_userId_key" ON "StatsProfile"("userId");

-- AddForeignKey
ALTER TABLE "StatsProfile" ADD CONSTRAINT "StatsProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
