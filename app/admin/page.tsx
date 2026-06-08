import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import AdminDashboardView from "./AdminDashboardView";

export default async function AdminDashboard({ 
  searchParams 
}: { 
  searchParams: { uid?: string } 
}) {
  const resolvedParams = await searchParams;
  const uid = resolvedParams.uid;

  if (!uid) {
    redirect('/login');
  }

  // ดึงข้อมูล Admin และเช็คสิทธิ์
  const admin = await prisma.user.findUnique({
    where: { id: uid },
    include: { roles: true }
  });

  const isAdmin = admin?.roles?.some((r: any) => r.name === 'ADMIN');

  if (!admin || !isAdmin) {
    redirect('/login');
  }

  // ดึงข้อมูลสถิติต่างๆ
  const totalSubjects = await prisma.subject.count();
  const activeProjects = await prisma.project.count({ where: { status: { not: 'REJECTED' } } });
  const totalDocs = await prisma.document.count();

  const latestDocs = await prisma.document.findMany({
    take: 5,
    orderBy: { uploadedAt: 'desc' },
    include: { uploader: true }
  });

  const pendingProjects = await prisma.project.findMany({
    where: { status: 'PENDING_APPROVAL' },
    take: 3,
    orderBy: { createdAt: 'desc' },
    include: { members: { include: { user: true } } }
  });

  const lecturers = await prisma.user.findMany({
    where: { 
      roles: { 
        some: { 
          name: { in: ['LECTURER', 'ADVISOR', 'INSTRUCTOR'] }
        } 
      } 
    },
    select: { department: true }
  });
  
  const deptCount: Record<string, number> = {};
  lecturers.forEach(l => {
    const dept = l.department || 'ทั่วไป';
    deptCount[dept] = (deptCount[dept] || 0) + 1;
  });
  const departments = Object.entries(deptCount).map(([name, count]) => ({ name, count }));

  return (
    <AdminDashboardView 
      admin={admin}
      uid={uid}
      totalSubjects={totalSubjects}
      activeProjects={activeProjects}
      totalDocs={totalDocs}
      latestDocs={latestDocs}
      pendingProjects={pendingProjects}
      departments={departments}
    />
  );
}