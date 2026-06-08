import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import LecturerDashboardView from "./LecturerDashboardView";

export default async function LecturerDashboard({ 
  searchParams 
}: { 
  searchParams: { uid?: string; tab?: string; year?: string } 
}) {
  const resolvedParams = await searchParams;
  const uid = resolvedParams.uid;
  const currentTab = resolvedParams.tab || 'overview';
  const selectedYear = resolvedParams.year || 'ALL';

  if (!uid) redirect('/login');

  // 1. ดึงข้อมูลอาจารย์และโครงงานที่ดูแลทั้งหมด
  const lecturer = await prisma.user.findUnique({
    where: { id: uid },
    include: {
      advisedProjects: {
        include: {
          project: {
            include: {
              members: { include: { user: true } },
              meetingLogs: { orderBy: { meetDate: 'asc' } },
              documents: { orderBy: { uploadedAt: 'desc' } }
            }
          }
        }
      }
    }
  });

  if (!lecturer) redirect('/login');

  // 2. ดึงประวัติเฉพาะที่อาจารย์คนนี้ทำ
  const rawLogs = await prisma.projectLog.findMany({
    where: { userId: uid }, 
    orderBy: { createdAt: 'desc' },
    include: { project: true, user: true } 
  });

  // 3. ดึงข้อมูลรายวิชาที่มีวันสอบ
  const subjectsWithExams = await prisma.subject.findMany({
    where: { finalExamDate: { not: null } }
  });

  return (
    <LecturerDashboardView 
      lecturer={lecturer}
      uid={uid}
      currentTab={currentTab}
      selectedYear={selectedYear}
      rawLogs={rawLogs}
      subjectsWithExams={subjectsWithExams}
    />
  );
}