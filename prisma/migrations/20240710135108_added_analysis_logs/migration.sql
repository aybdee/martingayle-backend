-- CreateTable
CREATE TABLE "AnalysisLogs" (
    "id" SERIAL NOT NULL,
    "coinFace" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AnalysisLogs_pkey" PRIMARY KEY ("id")
);
