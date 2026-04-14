ALTER TABLE "Card" ADD COLUMN "commentCount" INTEGER NOT NULL DEFAULT 0;

CREATE TABLE "CardComment" (
    "id" BIGSERIAL NOT NULL,
    "cardId" BIGINT NOT NULL,
    "authorUserId" BIGINT NOT NULL,
    "content" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'published',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CardComment_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "CardComment_cardId_createdAt_idx" ON "CardComment"("cardId", "createdAt");
CREATE INDEX "CardComment_authorUserId_createdAt_idx" ON "CardComment"("authorUserId", "createdAt");

ALTER TABLE "CardComment" ADD CONSTRAINT "CardComment_cardId_fkey" FOREIGN KEY ("cardId") REFERENCES "Card"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "CardComment" ADD CONSTRAINT "CardComment_authorUserId_fkey" FOREIGN KEY ("authorUserId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
