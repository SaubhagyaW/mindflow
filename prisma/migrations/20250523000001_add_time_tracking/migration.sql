-- Add time tracking fields to Subscription model
ALTER TABLE "Subscription" ADD COLUMN IF NOT EXISTS "monthlyTimeLimit" INTEGER DEFAULT 3600;
ALTER TABLE "Subscription" ADD COLUMN IF NOT EXISTS "usedTime" INTEGER DEFAULT 0;

-- Update existing subscriptions with appropriate time limits
UPDATE "Subscription" SET "monthlyTimeLimit" = 3600 WHERE "plan" = 'free';
UPDATE "Subscription" SET "monthlyTimeLimit" = 36000 WHERE "plan" = 'pro-10h';
UPDATE "Subscription" SET "monthlyTimeLimit" = 72000 WHERE "plan" = 'pro-20h';
UPDATE "Subscription" SET "monthlyTimeLimit" = -1 WHERE "plan" = 'pro-unlimited';
