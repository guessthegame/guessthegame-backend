-- CreateEnum
CREATE TYPE "UserRoleEnum" AS ENUM ('Player', 'Admin');

-- CreateTable
CREATE TABLE "SolvedScreenshot" (
    "id" SERIAL NOT NULL,
    "screenshotId" INTEGER NOT NULL,
    "userId" INTEGER NOT NULL,

    CONSTRAINT "SolvedScreenshot_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Image" (
    "id" SERIAL NOT NULL,
    "creationDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "originalUuid" UUID NOT NULL,
    "transformedUuid" UUID NOT NULL,
    "transformations" JSONB NOT NULL,

    CONSTRAINT "Image_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Screenshot" (
    "id" SERIAL NOT NULL,
    "creationDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "gameName" TEXT NOT NULL,
    "year" INTEGER NOT NULL,
    "imageId" INTEGER NOT NULL,
    "isValidated" BOOLEAN NOT NULL DEFAULT false,
    "addedByUserId" INTEGER NOT NULL,

    CONSTRAINT "Screenshot_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PhoneticName" (
    "id" SERIAL NOT NULL,
    "originalName" TEXT NOT NULL,
    "phoneticName" TEXT NOT NULL,
    "screenshotId" INTEGER NOT NULL,

    CONSTRAINT "PhoneticName_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "User" (
    "id" SERIAL NOT NULL,
    "uuid" UUID NOT NULL,
    "creationDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "isRegistered" BOOLEAN NOT NULL DEFAULT false,
    "browserToken" TEXT,
    "username" CITEXT NOT NULL,
    "passwordHash" TEXT,
    "email" CITEXT,
    "roles" "UserRoleEnum"[],
    "signUpDate" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserRefreshToken" (
    "id" SERIAL NOT NULL,
    "creationDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "token" TEXT NOT NULL,
    "expirationDate" TIMESTAMP(3) NOT NULL,
    "userId" INTEGER NOT NULL,

    CONSTRAINT "UserRefreshToken_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "SolvedScreenshot_userId_screenshotId_key" ON "SolvedScreenshot"("userId", "screenshotId");

-- CreateIndex
CREATE UNIQUE INDEX "Image_originalUuid_key" ON "Image"("originalUuid");

-- CreateIndex
CREATE UNIQUE INDEX "Image_transformedUuid_key" ON "Image"("transformedUuid");

-- CreateIndex
CREATE UNIQUE INDEX "Screenshot_imageId_key" ON "Screenshot"("imageId");

-- CreateIndex
CREATE UNIQUE INDEX "User_uuid_key" ON "User"("uuid");

-- CreateIndex
CREATE UNIQUE INDEX "User_browserToken_key" ON "User"("browserToken");

-- CreateIndex
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");

-- CreateIndex
CREATE UNIQUE INDEX "UserRefreshToken_token_key" ON "UserRefreshToken"("token");

-- AddForeignKey
ALTER TABLE "SolvedScreenshot" ADD CONSTRAINT "SolvedScreenshot_screenshotId_fkey" FOREIGN KEY ("screenshotId") REFERENCES "Screenshot"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SolvedScreenshot" ADD CONSTRAINT "SolvedScreenshot_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Screenshot" ADD CONSTRAINT "Screenshot_imageId_fkey" FOREIGN KEY ("imageId") REFERENCES "Image"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Screenshot" ADD CONSTRAINT "Screenshot_addedByUserId_fkey" FOREIGN KEY ("addedByUserId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PhoneticName" ADD CONSTRAINT "PhoneticName_screenshotId_fkey" FOREIGN KEY ("screenshotId") REFERENCES "Screenshot"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserRefreshToken" ADD CONSTRAINT "UserRefreshToken_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
