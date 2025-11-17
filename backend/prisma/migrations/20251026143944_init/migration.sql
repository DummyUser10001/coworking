/*
  Warnings:

  - You are about to drop the column `middletName` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `phone` on the `users` table. All the data in the column will be lost.
  - Added the required column `middleName` to the `users` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "users" DROP COLUMN "middletName",
DROP COLUMN "phone",
ADD COLUMN     "middleName" TEXT NOT NULL;
