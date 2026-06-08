/*
  Warnings:

  - The values [COMMITTEE] on the enum `AdvisorRole` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `version` on the `documents` table. All the data in the column will be lost.
  - You are about to drop the column `lecturer_id` on the `project_advisors` table. All the data in the column will be lost.
  - You are about to drop the column `student_id` on the `project_members` table. All the data in the column will be lost.
  - You are about to drop the `evaluations` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `lecturers` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `notifications` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `students` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[project_id,user_id]` on the table `project_members` will be added. If there are existing duplicate values, this will fail.
  - Changed the type of `file_type` on the `documents` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Added the required column `user_id` to the `project_advisors` table without a default value. This is not possible if the table is not empty.
  - Added the required column `user_id` to the `project_members` table without a default value. This is not possible if the table is not empty.
  - Added the required column `first_name` to the `users` table without a default value. This is not possible if the table is not empty.
  - Added the required column `last_name` to the `users` table without a default value. This is not possible if the table is not empty.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "AdvisorRole_new" AS ENUM ('ADVISOR', 'CO_ADVISOR');
ALTER TABLE "project_advisors" ALTER COLUMN "role" TYPE "AdvisorRole_new" USING ("role"::text::"AdvisorRole_new");
ALTER TYPE "AdvisorRole" RENAME TO "AdvisorRole_old";
ALTER TYPE "AdvisorRole_new" RENAME TO "AdvisorRole";
DROP TYPE "AdvisorRole_old";
COMMIT;

-- DropForeignKey
ALTER TABLE "comments" DROP CONSTRAINT "comments_project_id_fkey";

-- DropForeignKey
ALTER TABLE "documents" DROP CONSTRAINT "documents_project_id_fkey";

-- DropForeignKey
ALTER TABLE "evaluations" DROP CONSTRAINT "evaluations_lecturer_id_fkey";

-- DropForeignKey
ALTER TABLE "evaluations" DROP CONSTRAINT "evaluations_project_id_fkey";

-- DropForeignKey
ALTER TABLE "lecturers" DROP CONSTRAINT "lecturers_user_id_fkey";

-- DropForeignKey
ALTER TABLE "notifications" DROP CONSTRAINT "notifications_user_id_fkey";

-- DropForeignKey
ALTER TABLE "project_advisors" DROP CONSTRAINT "project_advisors_lecturer_id_fkey";

-- DropForeignKey
ALTER TABLE "project_advisors" DROP CONSTRAINT "project_advisors_project_id_fkey";

-- DropForeignKey
ALTER TABLE "project_members" DROP CONSTRAINT "project_members_project_id_fkey";

-- DropForeignKey
ALTER TABLE "project_members" DROP CONSTRAINT "project_members_student_id_fkey";

-- DropForeignKey
ALTER TABLE "students" DROP CONSTRAINT "students_user_id_fkey";

-- DropIndex
DROP INDEX "project_members_project_id_student_id_key";

-- AlterTable
ALTER TABLE "documents" DROP COLUMN "version",
DROP COLUMN "file_type",
ADD COLUMN     "file_type" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "project_advisors" DROP COLUMN "lecturer_id",
ADD COLUMN     "user_id" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "project_members" DROP COLUMN "student_id",
ADD COLUMN     "user_id" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "department" TEXT,
ADD COLUMN     "first_name" TEXT NOT NULL,
ADD COLUMN     "last_name" TEXT NOT NULL,
ADD COLUMN     "major" TEXT,
ADD COLUMN     "phone" TEXT,
ADD COLUMN     "position" TEXT,
ADD COLUMN     "year" INTEGER;

-- DropTable
DROP TABLE "evaluations";

-- DropTable
DROP TABLE "lecturers";

-- DropTable
DROP TABLE "notifications";

-- DropTable
DROP TABLE "students";

-- DropEnum
DROP TYPE "DocType";

-- CreateTable
CREATE TABLE "project_chapters" (
    "id" SERIAL NOT NULL,
    "project_id" INTEGER NOT NULL,
    "chapter_number" INTEGER NOT NULL,
    "title" TEXT,
    "content" TEXT,
    "status" TEXT NOT NULL DEFAULT 'draft',
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "project_chapters_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "project_logs" (
    "id" SERIAL NOT NULL,
    "project_id" INTEGER NOT NULL,
    "user_id" INTEGER NOT NULL,
    "action" TEXT NOT NULL,
    "details" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "project_logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "project_chapters_project_id_chapter_number_key" ON "project_chapters"("project_id", "chapter_number");

-- CreateIndex
CREATE UNIQUE INDEX "project_members_project_id_user_id_key" ON "project_members"("project_id", "user_id");

-- AddForeignKey
ALTER TABLE "project_members" ADD CONSTRAINT "project_members_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "projects"("project_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "project_members" ADD CONSTRAINT "project_members_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "project_advisors" ADD CONSTRAINT "project_advisors_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "projects"("project_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "project_advisors" ADD CONSTRAINT "project_advisors_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "project_chapters" ADD CONSTRAINT "project_chapters_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "projects"("project_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "project_logs" ADD CONSTRAINT "project_logs_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "projects"("project_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "project_logs" ADD CONSTRAINT "project_logs_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "documents" ADD CONSTRAINT "documents_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "projects"("project_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "comments" ADD CONSTRAINT "comments_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "projects"("project_id") ON DELETE CASCADE ON UPDATE CASCADE;
