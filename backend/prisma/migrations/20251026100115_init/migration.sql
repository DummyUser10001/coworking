-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('CLIENT', 'ADMIN');

-- CreateEnum
CREATE TYPE "WorkstationType" AS ENUM ('DESK', 'PRIVATE_OFFICE', 'MEETING_ROOM', 'PHONE_BOOTH', 'CREATIVE_SPACE');

-- CreateEnum
CREATE TYPE "InventoryType" AS ENUM ('MONITOR', 'PROJECTOR', 'HEADPHONES', 'WHITEBOARD', 'VIDEO_CONFERENCE', 'PRINTER', 'SCANNER', 'CHAIR');

-- CreateEnum
CREATE TYPE "BookingStatus" AS ENUM ('PENDING', 'CONFIRMED', 'ACTIVE', 'COMPLETED', 'CANCELLED', 'NO_SHOW');

-- CreateEnum
CREATE TYPE "PaymentMethod" AS ENUM ('CARD', 'BANK_TRANSFER', 'CASH', 'DIGITAL_WALLET');

-- CreateEnum
CREATE TYPE "PaymentStatus" AS ENUM ('PENDING', 'PROCESSING', 'COMPLETED', 'FAILED', 'REFUNDED');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "role" "UserRole" NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT,
    "password" TEXT NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "coworking_centers" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "location" TEXT NOT NULL,
    "isOpen" BOOLEAN NOT NULL DEFAULT true,
    "phone" TEXT,
    "email" TEXT,
    "openingTime" TEXT NOT NULL,
    "closingTime" TEXT NOT NULL,
    "amenities" TEXT[],

    CONSTRAINT "coworking_centers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "workstations" (
    "id" TEXT NOT NULL,
    "coworkingCenterId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" "WorkstationType" NOT NULL,
    "capacity" INTEGER NOT NULL,
    "basePricePerHour" DOUBLE PRECISION NOT NULL,
    "basePricePerDay" DOUBLE PRECISION NOT NULL,
    "basePricePerMonth" DOUBLE PRECISION NOT NULL,
    "isTaken" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "workstations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "inventory_items" (
    "id" TEXT NOT NULL,
    "workstationId" TEXT NOT NULL,
    "type" "InventoryType" NOT NULL,
    "description" TEXT,
    "quantity" INTEGER NOT NULL DEFAULT 1,

    CONSTRAINT "inventory_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "bookings" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "coworkingCenterId" TEXT NOT NULL,
    "workstationId" TEXT NOT NULL,
    "startTime" TIMESTAMP(3) NOT NULL,
    "endTime" TIMESTAMP(3) NOT NULL,
    "basePrice" DOUBLE PRECISION NOT NULL,
    "discountPercentage" DOUBLE PRECISION DEFAULT 0,
    "finalPrice" DOUBLE PRECISION NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'RUB',
    "status" "BookingStatus" NOT NULL DEFAULT 'PENDING',

    CONSTRAINT "bookings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "discounts" (
    "id" TEXT NOT NULL,
    "coworkingCenterId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "percentage" DOUBLE PRECISION NOT NULL,
    "maxDiscountAmount" DOUBLE PRECISION,
    "usageLimit" INTEGER,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "applicableDays" TEXT[],
    "applicableHours" TEXT[],
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "priority" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "discounts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "payments" (
    "id" TEXT NOT NULL,
    "bookingId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "cost" DOUBLE PRECISION NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "paymentMethod" "PaymentMethod" NOT NULL,
    "status" "PaymentStatus" NOT NULL DEFAULT 'PENDING',
    "transactionId" TEXT,
    "paymentTime" TIMESTAMP(3),

    CONSTRAINT "payments_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "payments_bookingId_key" ON "payments"("bookingId");

-- AddForeignKey
ALTER TABLE "workstations" ADD CONSTRAINT "workstations_coworkingCenterId_fkey" FOREIGN KEY ("coworkingCenterId") REFERENCES "coworking_centers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inventory_items" ADD CONSTRAINT "inventory_items_workstationId_fkey" FOREIGN KEY ("workstationId") REFERENCES "workstations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_coworkingCenterId_fkey" FOREIGN KEY ("coworkingCenterId") REFERENCES "coworking_centers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_workstationId_fkey" FOREIGN KEY ("workstationId") REFERENCES "workstations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "discounts" ADD CONSTRAINT "discounts_coworkingCenterId_fkey" FOREIGN KEY ("coworkingCenterId") REFERENCES "coworking_centers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payments" ADD CONSTRAINT "payments_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "bookings"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payments" ADD CONSTRAINT "payments_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
