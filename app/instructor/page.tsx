import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import InstructorDashboardView from "./InstructorDashboardView"; 

export default async function InstructorDashboard({
  searchParams
}: {
  searchParams: { uid?: string; tab?: string; year?: string }
}) {
  const resolvedParams = await searchParams;
  const uid = resolvedParams.uid;
  const currentTab = resolvedParams.tab || 'overview';
  const selectedYear = resolvedParams.year || 'ALL';

  if (!uid) {
    redirect('/login');
  }

  const instructor = await prisma.user.findUnique({
    where: { id: uid }
  });

  if (!instructor) {
    redirect('/login');
  }

  // ดึงข้อมูลโปรเจกต์ทั้งหมด พร้อมเอกสาร
  const allProjects = await prisma.project.findMany({
    include: {
      members: { include: { user: true } },
      advisors: { include: { user: true } },
      meetingLogs: true,
      documents: true // ✅ ดึงเอกสารมาเพื่อหาคำขอสอบ
    },
    orderBy: { createdAt: 'desc' }
  });

  const rawLogs = await prisma.projectLog.findMany({
    where: { userId: uid },
    orderBy: { createdAt: 'desc' },
    include: { project: true, user: true }
  });

  const subjects = await prisma.subject.findMany({
    orderBy: { subjectCode: 'asc' }
  });

  const filteredProjects = allProjects.filter(p =>
    selectedYear === 'ALL' || p.academicYear?.toString() === selectedYear
  );

  const activeProjects = filteredProjects.filter(p => p.status !== 'PENDING_APPROVAL');
  
  // ✅ 1. โครงงานที่รออนุมัติ (เติม as string เพื่อแก้ Error TypeScript PENDING_INSTRUCTOR)
  const pendingTopics = filteredProjects.filter(p => (p.status as string) === 'PENDING_INSTRUCTOR');
  
  // ✅ 2. หาเอกสารขอสอบที่ "ผ่านการอนุมัติจากประธานหลักสูตรแล้ว"
  const approvedExamRequests = filteredProjects.flatMap(project => 
    project.documents
      .filter((doc: any) => doc.fileType === "ยื่นขอสอบโครงงาน" && doc.status === "APPROVED")
      .map((doc: any) => ({ ...doc, project }))
  );

  // ✅ 3. สร้างตัวแปร notifications สำหรับรวมการแจ้งเตือนทั้งหมด
  const notifications = [
    ...pendingTopics.map(project => ({
      id: `topic-${project.id}`,
      title: "รอพิจารณาอนุมัติหัวข้อ",
      details: project.titleTh || "โครงงานใหม่ (ผ่านที่ปรึกษาแล้ว)",
      createdAt: project.createdAt,
      link: `?uid=${uid}&tab=approvals&year=${selectedYear}`
    })),
    ...approvedExamRequests.map((examReq: any) => ({
      id: `exam-${examReq.id}`,
      title: "✅ อนุมัติขอสอบโครงงานสำเร็จ",
      details: `${examReq.project.titleTh} (โดยประธานหลักสูตร)`,
      createdAt: examReq.uploadedAt,
      link: `?uid=${uid}&tab=overview&year=${selectedYear}`
    }))
  ].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()); // เรียงตามเวลาล่าสุด

  // ✅ 4. ส่งข้อมูลทั้งหมดไปยัง Client Component
  return (
    <InstructorDashboardView 
      uid={uid}
      currentTab={currentTab}
      selectedYear={selectedYear}
      instructor={instructor}
      subjects={subjects}
      filteredProjects={filteredProjects}
      activeProjects={activeProjects}
      pendingTopics={pendingTopics}
      notifications={notifications}
      rawLogs={rawLogs}
    />
  );
}