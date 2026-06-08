import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import HeadDashboardView from "./HeadDashboardView"; // ✅ นำเข้า Client Component

export default async function HeadDashboardPage({ 
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

  // ดึงข้อมูลประธานหลักสูตร
  const headUser = await prisma.user.findUnique({
    where: { id: uid }
  });

  if (!headUser) {
    redirect('/login');
  }

  // ดึงข้อมูลโครงงาน "ทั้งหมด" ในสาขาวิชา พร้อมกับเอกสาร
  const allProjects = await prisma.project.findMany({
    include: {
      members: { include: { user: true } },
      advisors: { include: { user: true } },
      documents: true, 
    },
    orderBy: { createdAt: 'desc' }
  });

  const filteredProjects = allProjects.filter(p => 
    selectedYear === 'ALL' || p.academicYear?.toString() === selectedYear
  );

  const activeProjects = filteredProjects.filter(p => p.status !== 'PENDING_APPROVAL');
  const pendingFinalApprovals = filteredProjects.filter(p => p.status === 'PENDING_APPROVAL');
  const pendingExamRequests = filteredProjects.flatMap(p => 
    p.documents
      .filter((d: any) => d.status === 'PENDING_CHAIR')
      .map((d: any) => ({ ...d, project: p }))
  );

  // ==========================================
  // ✅ คำนวณสถิติความคืบหน้าภาพรวม
  // ==========================================
  const totalDisplay = filteredProjects.length > 0 ? filteredProjects.length : 1; 
  
  const approvedCount = activeProjects.length;
  const approvedPercent = Math.round((approvedCount / totalDisplay) * 100);

  const chapter3Count = filteredProjects.filter(p => 
    p.documents.some((d: any) => d.fileType === 'ยื่นขอสอบเค้าโครง')
  ).length;
  const chapter3Percent = Math.round((chapter3Count / totalDisplay) * 100);

  const chapter5Count = filteredProjects.filter(p => 
    p.documents.some((d: any) => d.fileType === 'ยื่นขอสอบโครงงาน')
  ).length;
  const chapter5Percent = Math.round((chapter5Count / totalDisplay) * 100);

  // รวมสถิติเพื่อส่งเป็น Props
  const stats = {
    totalDisplay,
    approvedCount, approvedPercent,
    chapter3Count, chapter3Percent,
    chapter5Count, chapter5Percent
  };

  // ✅ ส่งข้อมูลไปแสดงผลที่ Client Component
  return (
    <HeadDashboardView 
      uid={uid}
      currentTab={currentTab}
      selectedYear={selectedYear}
      headUser={headUser}
      filteredProjects={filteredProjects}
      activeProjects={activeProjects}
      pendingFinalApprovals={pendingFinalApprovals}
      pendingExamRequests={pendingExamRequests}
      stats={stats}
    />
  );
}