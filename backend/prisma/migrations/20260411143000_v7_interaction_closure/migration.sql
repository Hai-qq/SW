CREATE TABLE "CardFeedback" (
    "id" BIGSERIAL NOT NULL,
    "userId" BIGINT NOT NULL,
    "cardId" BIGINT NOT NULL,
    "feedbackType" TEXT NOT NULL,
    "category" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CardFeedback_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "ConversationReadState" (
    "id" BIGSERIAL NOT NULL,
    "conversationId" BIGINT NOT NULL,
    "userId" BIGINT NOT NULL,
    "lastReadAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ConversationReadState_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "DiscoveryReaction" (
    "id" BIGSERIAL NOT NULL,
    "postId" BIGINT NOT NULL,
    "userId" BIGINT NOT NULL,
    "reactionType" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DiscoveryReaction_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "DiscoveryComment" (
    "id" BIGSERIAL NOT NULL,
    "postId" BIGINT NOT NULL,
    "authorUserId" BIGINT NOT NULL,
    "content" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'published',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DiscoveryComment_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "CardFeedback_userId_cardId_feedbackType_key" ON "CardFeedback"("userId", "cardId", "feedbackType");
CREATE INDEX "CardFeedback_userId_createdAt_idx" ON "CardFeedback"("userId", "createdAt");
CREATE INDEX "CardFeedback_category_idx" ON "CardFeedback"("category");

CREATE UNIQUE INDEX "ConversationReadState_conversationId_userId_key" ON "ConversationReadState"("conversationId", "userId");
CREATE INDEX "ConversationReadState_userId_updatedAt_idx" ON "ConversationReadState"("userId", "updatedAt");

CREATE UNIQUE INDEX "DiscoveryReaction_postId_userId_reactionType_key" ON "DiscoveryReaction"("postId", "userId", "reactionType");
CREATE INDEX "DiscoveryReaction_userId_createdAt_idx" ON "DiscoveryReaction"("userId", "createdAt");

CREATE INDEX "DiscoveryComment_postId_createdAt_idx" ON "DiscoveryComment"("postId", "createdAt");
CREATE INDEX "DiscoveryComment_authorUserId_createdAt_idx" ON "DiscoveryComment"("authorUserId", "createdAt");

ALTER TABLE "CardFeedback" ADD CONSTRAINT "CardFeedback_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "CardFeedback" ADD CONSTRAINT "CardFeedback_cardId_fkey" FOREIGN KEY ("cardId") REFERENCES "Card"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "ConversationReadState" ADD CONSTRAINT "ConversationReadState_conversationId_fkey" FOREIGN KEY ("conversationId") REFERENCES "Conversation"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "ConversationReadState" ADD CONSTRAINT "ConversationReadState_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "DiscoveryReaction" ADD CONSTRAINT "DiscoveryReaction_postId_fkey" FOREIGN KEY ("postId") REFERENCES "DiscoveryPost"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "DiscoveryReaction" ADD CONSTRAINT "DiscoveryReaction_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "DiscoveryComment" ADD CONSTRAINT "DiscoveryComment_postId_fkey" FOREIGN KEY ("postId") REFERENCES "DiscoveryPost"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "DiscoveryComment" ADD CONSTRAINT "DiscoveryComment_authorUserId_fkey" FOREIGN KEY ("authorUserId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
