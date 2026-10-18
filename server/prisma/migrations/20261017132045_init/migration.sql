-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "fullName" TEXT NOT NULL,
    "collegeName" TEXT NOT NULL,
    "course" TEXT NOT NULL,
    "academicYear" TEXT NOT NULL,
    "linkedinUrl" TEXT NOT NULL,
    "leetcodeUrl" TEXT NOT NULL,
    "leetcodeUsername" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Session" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Session_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CodingProblemSolve" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "provider" TEXT NOT NULL DEFAULT 'leetcode',
    "problemId" TEXT NOT NULL,
    "problemTitle" TEXT NOT NULL,
    "solvedAt" TIMESTAMP(3) NOT NULL,
    "solveDate" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CodingProblemSolve_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CodingProgressSync" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "provider" TEXT NOT NULL DEFAULT 'leetcode',
    "status" TEXT NOT NULL,
    "totalSolved" INTEGER,
    "newProblems" INTEGER NOT NULL DEFAULT 0,
    "errorMessage" TEXT,
    "syncedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CodingProgressSync_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AcademicResource" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "fileName" TEXT NOT NULL,
    "storagePath" TEXT NOT NULL,
    "fileSize" INTEGER NOT NULL,
    "mimeType" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AcademicResource_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ResearchPost" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "abstract" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "referenceLinks" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ResearchPost_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ResearchComment" (
    "id" TEXT NOT NULL,
    "postId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ResearchComment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "HackathonEvent" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "organizer" TEXT NOT NULL,
    "registrationUrl" TEXT NOT NULL,
    "eventStartDate" TIMESTAMP(3) NOT NULL,
    "eventEndDate" TIMESTAMP(3),
    "registrationDeadline" TIMESTAMP(3),
    "mode" TEXT NOT NULL,
    "location" TEXT,
    "category" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "HackathonEvent_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "User_email_idx" ON "User"("email");

-- CreateIndex
CREATE INDEX "User_leetcodeUsername_idx" ON "User"("leetcodeUsername");

-- CreateIndex
CREATE UNIQUE INDEX "Session_token_key" ON "Session"("token");

-- CreateIndex
CREATE INDEX "Session_token_idx" ON "Session"("token");

-- CreateIndex
CREATE INDEX "Session_userId_idx" ON "Session"("userId");

-- CreateIndex
CREATE INDEX "Session_expiresAt_idx" ON "Session"("expiresAt");

-- CreateIndex
CREATE INDEX "CodingProblemSolve_userId_idx" ON "CodingProblemSolve"("userId");

-- CreateIndex
CREATE INDEX "CodingProblemSolve_solveDate_idx" ON "CodingProblemSolve"("solveDate");

-- CreateIndex
CREATE INDEX "CodingProblemSolve_userId_solveDate_idx" ON "CodingProblemSolve"("userId", "solveDate");

-- CreateIndex
CREATE INDEX "CodingProblemSolve_provider_idx" ON "CodingProblemSolve"("provider");

-- CreateIndex
CREATE UNIQUE INDEX "CodingProblemSolve_userId_provider_problemId_key" ON "CodingProblemSolve"("userId", "provider", "problemId");

-- CreateIndex
CREATE INDEX "CodingProgressSync_userId_idx" ON "CodingProgressSync"("userId");

-- CreateIndex
CREATE INDEX "CodingProgressSync_userId_provider_idx" ON "CodingProgressSync"("userId", "provider");

-- CreateIndex
CREATE INDEX "CodingProgressSync_syncedAt_idx" ON "CodingProgressSync"("syncedAt");

-- CreateIndex
CREATE INDEX "AcademicResource_userId_idx" ON "AcademicResource"("userId");

-- CreateIndex
CREATE INDEX "AcademicResource_subject_idx" ON "AcademicResource"("subject");

-- CreateIndex
CREATE INDEX "AcademicResource_createdAt_idx" ON "AcademicResource"("createdAt");

-- CreateIndex
CREATE INDEX "ResearchPost_userId_idx" ON "ResearchPost"("userId");

-- CreateIndex
CREATE INDEX "ResearchPost_category_idx" ON "ResearchPost"("category");

-- CreateIndex
CREATE INDEX "ResearchPost_createdAt_idx" ON "ResearchPost"("createdAt");

-- CreateIndex
CREATE INDEX "ResearchComment_postId_idx" ON "ResearchComment"("postId");

-- CreateIndex
CREATE INDEX "ResearchComment_userId_idx" ON "ResearchComment"("userId");

-- CreateIndex
CREATE INDEX "HackathonEvent_userId_idx" ON "HackathonEvent"("userId");

-- CreateIndex
CREATE INDEX "HackathonEvent_eventStartDate_idx" ON "HackathonEvent"("eventStartDate");

-- CreateIndex
CREATE INDEX "HackathonEvent_category_idx" ON "HackathonEvent"("category");

-- CreateIndex
CREATE INDEX "HackathonEvent_createdAt_idx" ON "HackathonEvent"("createdAt");

-- AddForeignKey
ALTER TABLE "Session" ADD CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CodingProblemSolve" ADD CONSTRAINT "CodingProblemSolve_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CodingProgressSync" ADD CONSTRAINT "CodingProgressSync_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AcademicResource" ADD CONSTRAINT "AcademicResource_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ResearchPost" ADD CONSTRAINT "ResearchPost_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ResearchComment" ADD CONSTRAINT "ResearchComment_postId_fkey" FOREIGN KEY ("postId") REFERENCES "ResearchPost"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ResearchComment" ADD CONSTRAINT "ResearchComment_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HackathonEvent" ADD CONSTRAINT "HackathonEvent_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
