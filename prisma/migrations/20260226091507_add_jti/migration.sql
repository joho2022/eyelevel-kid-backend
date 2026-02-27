/*
  Warnings:

  - The values [kakao] on the enum `Provider` will be removed. If these variants are still used in the database, this will fail.
  - A unique constraint covering the columns `[jti]` on the table `RefreshToken` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `jti` to the `RefreshToken` table without a default value. This is not possible if the table is not empty.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "Provider_new" AS ENUM ('apple', 'google');
ALTER TABLE "User" ALTER COLUMN "provider" TYPE "Provider_new" USING ("provider"::text::"Provider_new");
ALTER TYPE "Provider" RENAME TO "Provider_old";
ALTER TYPE "Provider_new" RENAME TO "Provider";
DROP TYPE "public"."Provider_old";
COMMIT;

-- AlterTable
ALTER TABLE "RefreshToken" ADD COLUMN     "jti" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "RefreshToken_jti_key" ON "RefreshToken"("jti");
