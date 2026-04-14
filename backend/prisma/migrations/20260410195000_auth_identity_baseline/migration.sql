-- AlterTable
ALTER TABLE "User"
ADD COLUMN     "wechatOpenid" TEXT,
ADD COLUMN     "wechatUnionid" TEXT;

-- CreateTable
CREATE TABLE "UserAuthSession" (
    "id" BIGSERIAL NOT NULL,
    "userId" BIGINT NOT NULL,
    "accessToken" TEXT NOT NULL,
    "source" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UserAuthSession_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_wechatOpenid_key" ON "User"("wechatOpenid");

-- CreateIndex
CREATE UNIQUE INDEX "UserAuthSession_accessToken_key" ON "UserAuthSession"("accessToken");

-- CreateIndex
CREATE INDEX "UserAuthSession_userId_createdAt_idx" ON "UserAuthSession"("userId", "createdAt");

-- AddForeignKey
ALTER TABLE "UserAuthSession" ADD CONSTRAINT "UserAuthSession_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
