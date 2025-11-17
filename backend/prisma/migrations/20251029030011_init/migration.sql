/*
  Warnings:

  - You are about to drop the column `location` on the `coworking_centers` table. All the data in the column will be lost.
  - You are about to drop the column `name` on the `coworking_centers` table. All the data in the column will be lost.
  - Added the required column `latitude` to the `coworking_centers` table without a default value. This is not possible if the table is not empty.
  - Added the required column `longitude` to the `coworking_centers` table without a default value. This is not possible if the table is not empty.

*/
-- AlterEnum
ALTER TYPE "UserRole" ADD VALUE 'MANAGER';

-- AlterTable
ALTER TABLE "coworking_centers" DROP COLUMN "location",
DROP COLUMN "name",
ADD COLUMN     "latitude" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "longitude" DOUBLE PRECISION NOT NULL;
