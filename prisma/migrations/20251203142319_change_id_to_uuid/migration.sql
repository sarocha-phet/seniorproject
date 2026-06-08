/*
  Warnings:

  - The primary key for the `projects` table will be changed. If it partially fails, the table could be left without primary key constraint.

*/
-- DropForeignKey
ALTER TABLE "comments" DROP CONSTRAINT "comments_project_id_fkey";

-- DropForeignKey
ALTER TABLE "documents" DROP CONSTRAINT "documents_project_id_fkey";

-- DropForeignKey
ALTER TABLE "project_advisors" DROP CONSTRAINT "project_advisors_project_id_fkey";

-- DropForeignKey
ALTER TABLE "project_chapters" DROP CONSTRAINT "project_chapters_project_id_fkey";

-- DropForeignKey
ALTER TABLE "project_logs" DROP CONSTRAINT "project_logs_project_id_fkey";

-- DropForeignKey
ALTER TABLE "project_members" DROP CONSTRAINT "project_members_project_id_fkey";

-- AlterTable
ALTER TABLE "comments" ALTER COLUMN "project_id" SET DATA TYPE TEXT;

-- AlterTable
ALTER TABLE "documents" ALTER COLUMN "project_id" SET DATA TYPE TEXT;

-- AlterTable
ALTER TABLE "project_advisors" ALTER COLUMN "project_id" SET DATA TYPE TEXT;

-- AlterTable
ALTER TABLE "project_chapters" ALTER COLUMN "project_id" SET DATA TYPE TEXT;

-- AlterTable
ALTER TABLE "project_logs" ALTER COLUMN "project_id" SET DATA TYPE TEXT;

-- AlterTable
ALTER TABLE "project_members" ALTER COLUMN "project_id" SET DATA TYPE TEXT;

-- AlterTable
ALTER TABLE "projects" DROP CONSTRAINT "projects_pkey",
ALTER COLUMN "project_id" DROP DEFAULT,
ALTER COLUMN "project_id" SET DATA TYPE TEXT,
ADD CONSTRAINT "projects_pkey" PRIMARY KEY ("project_id");
DROP SEQUENCE "projects_project_id_seq";

-- AddForeignKey
ALTER TABLE "project_members" ADD CONSTRAINT "project_members_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "projects"("project_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "project_advisors" ADD CONSTRAINT "project_advisors_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "projects"("project_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "project_chapters" ADD CONSTRAINT "project_chapters_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "projects"("project_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "project_logs" ADD CONSTRAINT "project_logs_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "projects"("project_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "documents" ADD CONSTRAINT "documents_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "projects"("project_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "comments" ADD CONSTRAINT "comments_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "projects"("project_id") ON DELETE CASCADE ON UPDATE CASCADE;
