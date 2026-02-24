-- CreateEnum
CREATE TYPE "Provider" AS ENUM ('kakao', 'google');

-- CreateEnum
CREATE TYPE "AnswerStyle" AS ENUM ('story', 'reason');

-- CreateTable
CREATE TABLE "User" (
    "id" SERIAL NOT NULL,
    "socialId" TEXT NOT NULL,
    "provider" "Provider" NOT NULL,
    "nickname" VARCHAR(8) NOT NULL,
    "profileImage" TEXT,
    "answerStyle" "AnswerStyle" NOT NULL DEFAULT 'story',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_socialId_provider_key" ON "User"("socialId", "provider");
