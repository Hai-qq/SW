-- CreateTable
CREATE TABLE "User" (
    "id" BIGSERIAL NOT NULL,
    "nickname" TEXT NOT NULL,
    "avatarUrl" TEXT,
    "gender" TEXT,
    "ageRange" TEXT,
    "relationshipStatus" TEXT,
    "mbti" TEXT,
    "signature" TEXT,
    "city" TEXT,
    "onboardingCompleted" BOOLEAN NOT NULL DEFAULT false,
    "status" TEXT NOT NULL DEFAULT 'active',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OnboardingAnswer" (
    "id" BIGSERIAL NOT NULL,
    "userId" BIGINT NOT NULL,
    "questionId" INTEGER NOT NULL,
    "selectedValue" TEXT,
    "isSkipped" BOOLEAN NOT NULL DEFAULT false,
    "submittedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "OnboardingAnswer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserProfileTag" (
    "id" BIGSERIAL NOT NULL,
    "userId" BIGINT NOT NULL,
    "tagType" TEXT NOT NULL,
    "tagKey" TEXT NOT NULL,
    "tagValue" TEXT NOT NULL,
    "weight" DECIMAL(65,30) NOT NULL DEFAULT 1,
    "source" TEXT NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserProfileTag_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Card" (
    "id" BIGSERIAL NOT NULL,
    "authorUserId" BIGINT,
    "sourceType" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "agreeCount" INTEGER NOT NULL DEFAULT 0,
    "disagreeCount" INTEGER NOT NULL DEFAULT 0,
    "skipCount" INTEGER NOT NULL DEFAULT 0,
    "exposureCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Card_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CardExposure" (
    "id" BIGSERIAL NOT NULL,
    "userId" BIGINT NOT NULL,
    "cardId" BIGINT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "positionIndex" INTEGER,
    "exposedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CardExposure_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CardSwipe" (
    "id" BIGSERIAL NOT NULL,
    "userId" BIGINT NOT NULL,
    "cardId" BIGINT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "sourceTab" TEXT,
    "swipedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CardSwipe_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserSession" (
    "id" BIGSERIAL NOT NULL,
    "sessionId" TEXT NOT NULL,
    "userId" BIGINT NOT NULL,
    "entryPage" TEXT NOT NULL,
    "enteredAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastActiveAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "validSwipeCount" INTEGER NOT NULL DEFAULT 0,
    "skipCount" INTEGER NOT NULL DEFAULT 0,
    "blindBoxChecked" BOOLEAN NOT NULL DEFAULT false,
    "blindBoxTriggered" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "UserSession_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MatchEvent" (
    "id" BIGSERIAL NOT NULL,
    "userId" BIGINT NOT NULL,
    "candidateUserId" BIGINT,
    "sessionId" TEXT NOT NULL,
    "triggerReason" TEXT NOT NULL,
    "matchScore" DECIMAL(65,30),
    "resultStatus" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MatchEvent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DiscoveryPost" (
    "id" BIGSERIAL NOT NULL,
    "authorUserId" BIGINT NOT NULL,
    "postType" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "title" TEXT,
    "content" TEXT NOT NULL,
    "anonymous" BOOLEAN NOT NULL DEFAULT false,
    "status" TEXT NOT NULL,
    "likeCount" INTEGER NOT NULL DEFAULT 0,
    "commentCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DiscoveryPost_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserPhoto" (
    "id" BIGSERIAL NOT NULL,
    "userId" BIGINT NOT NULL,
    "photoUrl" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "status" TEXT NOT NULL DEFAULT 'active',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UserPhoto_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "OnboardingAnswer_userId_questionId_key" ON "OnboardingAnswer"("userId", "questionId");

-- CreateIndex
CREATE INDEX "CardExposure_userId_exposedAt_idx" ON "CardExposure"("userId", "exposedAt");

-- CreateIndex
CREATE INDEX "CardExposure_sessionId_idx" ON "CardExposure"("sessionId");

-- CreateIndex
CREATE INDEX "CardExposure_cardId_exposedAt_idx" ON "CardExposure"("cardId", "exposedAt");

-- CreateIndex
CREATE INDEX "CardSwipe_userId_swipedAt_idx" ON "CardSwipe"("userId", "swipedAt");

-- CreateIndex
CREATE INDEX "CardSwipe_cardId_swipedAt_idx" ON "CardSwipe"("cardId", "swipedAt");

-- CreateIndex
CREATE INDEX "CardSwipe_sessionId_idx" ON "CardSwipe"("sessionId");

-- CreateIndex
CREATE UNIQUE INDEX "CardSwipe_userId_cardId_key" ON "CardSwipe"("userId", "cardId");

-- CreateIndex
CREATE UNIQUE INDEX "UserSession_sessionId_key" ON "UserSession"("sessionId");

-- AddForeignKey
ALTER TABLE "OnboardingAnswer" ADD CONSTRAINT "OnboardingAnswer_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserProfileTag" ADD CONSTRAINT "UserProfileTag_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Card" ADD CONSTRAINT "Card_authorUserId_fkey" FOREIGN KEY ("authorUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CardExposure" ADD CONSTRAINT "CardExposure_cardId_fkey" FOREIGN KEY ("cardId") REFERENCES "Card"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CardSwipe" ADD CONSTRAINT "CardSwipe_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CardSwipe" ADD CONSTRAINT "CardSwipe_cardId_fkey" FOREIGN KEY ("cardId") REFERENCES "Card"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserSession" ADD CONSTRAINT "UserSession_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MatchEvent" ADD CONSTRAINT "MatchEvent_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MatchEvent" ADD CONSTRAINT "MatchEvent_candidateUserId_fkey" FOREIGN KEY ("candidateUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DiscoveryPost" ADD CONSTRAINT "DiscoveryPost_authorUserId_fkey" FOREIGN KEY ("authorUserId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserPhoto" ADD CONSTRAINT "UserPhoto_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
