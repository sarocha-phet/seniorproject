import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import StudentDashboardView from "./StudentDashboardView";

export default async function StudentDashboard({ 
  searchParams 
}: { 
  searchParams: { uid?: string } 
}) {
  const resolvedParams = await searchParams;
  const uid = resolvedParams.uid;

  if (!uid) redirect('/login');

  // 1. ดึงข้อมูล User และ โครงงาน (ใช้ Prisma ที่ Server เท่านั้น)
  const user = await prisma.user.findUnique({
    where: { id: uid },
    include: {
      projects: {
        include: {
          project: {
            include: {
              subject: true,
              advisors: { include: { user: true } },
              meetingLogs: { orderBy: { meetDate: 'desc' } }
            }
          }
        }
      }
    }
  });

  if (!user) redirect('/login');

  const activeProject = user.projects[0]?.project;

  // 2. ข้อมูลรายวิชา
  const currentSubject = await prisma.subject.findFirst({
    where: { academicYear: activeProject?.academicYear || 2567 },
  });

  const availableSubjects = await prisma.subject.findMany({
    where: { academicYear: 2568, isActive: true }, 
    orderBy: { subjectCode: 'asc' }
  });

  const displayYear = activeProject?.subject?.academicYear || activeProject?.academicYear || availableSubjects[0]?.academicYear || 2568;

  // 3. แจ้งเตือน (Logic เดิม)
  let notifications: any[] = [];
  if (activeProject) {
    const myLogs = await prisma.projectLog.findMany({
      where: { projectId: activeProject.id },
      orderBy: { createdAt: 'desc' },
      take: 10
    });
    notifications = myLogs.map(log => ({
      id: log.id,
      title: log.action.includes("APPROVED") ? "✅ อนุมัติ" : "อัปเดตโครงงาน",
      details: log.details,
      createdAt: log.createdAt
    }));
  }

  // ส่งข้อมูลทั้งหมดไปให้ View แสดงผล
  return (
    <StudentDashboardView 
      user={user} 
      activeProject={activeProject}
      availableSubjects={availableSubjects}
      currentSubject={currentSubject}
      notifications={notifications}
      uid={uid}
      displayYear={displayYear}
    />
  );
}