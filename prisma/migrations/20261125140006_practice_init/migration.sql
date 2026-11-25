-- CreateTable
CREATE TABLE "Practice" (
    "id" SERIAL NOT NULL,
    "notes" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Practice_pkey" PRIMARY KEY ("id")
);
