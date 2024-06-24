-- CreateTable
CREATE TABLE "SportyProfile" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,

    CONSTRAINT "SportyProfile_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "SportyProfile_userId_key" ON "SportyProfile"("userId");

-- AddForeignKey
ALTER TABLE "SportyProfile" ADD CONSTRAINT "SportyProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
