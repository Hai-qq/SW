CREATE TABLE "UserConnection" (
    "id" BIGSERIAL NOT NULL,
    "userId" BIGINT NOT NULL,
    "targetUserId" BIGINT NOT NULL,
    "sourceMatchEventId" BIGINT,
    "status" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserConnection_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "UserConnection_userId_targetUserId_key" ON "UserConnection"("userId", "targetUserId");
CREATE INDEX "UserConnection_userId_status_createdAt_idx" ON "UserConnection"("userId", "status", "createdAt");

ALTER TABLE "UserConnection"
ADD CONSTRAINT "UserConnection_userId_fkey"
FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "UserConnection"
ADD CONSTRAINT "UserConnection_targetUserId_fkey"
FOREIGN KEY ("targetUserId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "UserConnection"
ADD CONSTRAINT "UserConnection_sourceMatchEventId_fkey"
FOREIGN KEY ("sourceMatchEventId") REFERENCES "MatchEvent"("id") ON DELETE SET NULL ON UPDATE CASCADE;
