-- Milestone 1 schema alignment: role tables and structured application lists.

CREATE TABLE "roles" (
    "id" UUID NOT NULL,
    "code" "UserRole" NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "roles_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "user_roles" (
    "userId" UUID NOT NULL,
    "roleId" UUID NOT NULL,
    "assignedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_roles_pkey" PRIMARY KEY ("userId","roleId")
);

CREATE TABLE "application_training_areas" (
    "applicationId" UUID NOT NULL,
    "trainingAreaId" UUID NOT NULL,

    CONSTRAINT "application_training_areas_pkey" PRIMARY KEY ("applicationId","trainingAreaId")
);

CREATE TABLE "application_certificates_offered" (
    "id" UUID NOT NULL,
    "applicationId" UUID NOT NULL,
    "name" VARCHAR(200) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "application_certificates_offered_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "application_delivery_methods" (
    "id" UUID NOT NULL,
    "applicationId" UUID NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "application_delivery_methods_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "roles_code_key" ON "roles"("code");
CREATE UNIQUE INDEX "application_certificates_offered_applicationId_name_key" ON "application_certificates_offered"("applicationId", "name");
CREATE UNIQUE INDEX "application_delivery_methods_applicationId_name_key" ON "application_delivery_methods"("applicationId", "name");

CREATE UNIQUE INDEX "applications_one_active_per_institution_key"
ON "applications"("institutionId")
WHERE "status" IN ('draft', 'submitted', 'initial_screening', 'payment_pending', 'under_review', 'changes_requested', 'resubmitted', 'final_review');

ALTER TABLE "user_roles" ADD CONSTRAINT "user_roles_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "user_roles" ADD CONSTRAINT "user_roles_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "roles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "application_training_areas" ADD CONSTRAINT "application_training_areas_applicationId_fkey" FOREIGN KEY ("applicationId") REFERENCES "applications"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "application_training_areas" ADD CONSTRAINT "application_training_areas_trainingAreaId_fkey" FOREIGN KEY ("trainingAreaId") REFERENCES "training_areas"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "application_certificates_offered" ADD CONSTRAINT "application_certificates_offered_applicationId_fkey" FOREIGN KEY ("applicationId") REFERENCES "applications"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "application_delivery_methods" ADD CONSTRAINT "application_delivery_methods_applicationId_fkey" FOREIGN KEY ("applicationId") REFERENCES "applications"("id") ON DELETE CASCADE ON UPDATE CASCADE;
