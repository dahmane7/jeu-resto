-- AlterTable
ALTER TABLE "Participation" ADD COLUMN "claim_code" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Participation_claim_code_key" ON "Participation"("claim_code");
