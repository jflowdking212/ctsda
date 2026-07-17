CREATE TABLE "pre_registrations" (
    "id" UUID NOT NULL,
    "institutionId" UUID,
    "email" VARCHAR(255) NOT NULL,
    "token" VARCHAR(255) NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "usedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "pre_registrations_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "pre_registrations_token_key" ON "pre_registrations"("token");

ALTER TABLE "pre_registrations" ADD CONSTRAINT "pre_registrations_institutionId_fkey" FOREIGN KEY ("institutionId") REFERENCES "institutions"("id") ON DELETE CASCADE ON UPDATE CASCADE;
