-- CreateEnum
CREATE TYPE "UserRoleEnum" AS ENUM ('Player', 'Admin');

-- CreateTable
CREATE TABLE "User" (
    "id" SERIAL NOT NULL,
    "uuid" UUID NOT NULL,
    "browserToken" TEXT,
    "username" CITEXT,
    "passwordHash" TEXT,
    "email" CITEXT,
    "roles" "UserRoleEnum"[],
    "creationDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "signUpDate" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserRefreshToken" (
    "id" SERIAL NOT NULL,
    "token" TEXT NOT NULL,
    "creationDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expirationDate" TIMESTAMP(3) NOT NULL,
    "userId" INTEGER NOT NULL,

    CONSTRAINT "UserRefreshToken_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_uuid_key" ON "User"("uuid");

-- CreateIndex
CREATE UNIQUE INDEX "User_browserToken_key" ON "User"("browserToken");

-- CreateIndex
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "UserRefreshToken_token_key" ON "UserRefreshToken"("token");

-- AddForeignKey
ALTER TABLE "UserRefreshToken" ADD CONSTRAINT "UserRefreshToken_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
