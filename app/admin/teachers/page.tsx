import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import TeacherListView from "./TeacherListView";

export default async function AdminTeacherListPage({ 
  searchParams 
}: { 
  searchParams: { uid?: string } 
}) {
  const resolvedParams = await searchParams;
  const uid = resolvedParams.uid;
  
  if (!uid) {
    redirect('/login');
  }

  // ดึงข้อมูลแอดมิน
  const admin = await prisma.user.findUnique({
    where: { id: uid },
    include: { roles: true }
  });

  if (!admin) {
    redirect('/login');
  }

  // ดึงข้อมูลอาจารย์ทั้งหมด (ค้นหาเฉพาะคนที่มี Role เป็นอาจารย์/ที่ปรึกษา/ประธานหลักสูตร)
  const rawTeachers = await prisma.user.findMany({
    where: {
      roles: {
        some: {
          name: { in: ['ADVISOR', 'INSTRUCTOR', 'CHAIR'] }
        }
      }
    },
    include: { roles: true },
    orderBy: { firstName: 'asc' }
  });

  // จัดกลุ่มอาจารย์ตามสาขาวิชา (Department)
  const groupedTeachers: Record<string, any[]> = {};
  
  rawTeachers.forEach(teacher => {
    const dept = teacher.department || "ไม่ระบุสาขา";
    if (!groupedTeachers[dept]) {
      groupedTeachers[dept] = [];
    }
    groupedTeachers[dept].push(teacher);
  });

  // แปลงจาก Object เป็น Array เพื่อให้ง่ายต่อการนำไป .map() ในหน้าจอ
  const departmentsList = Object.entries(groupedTeachers).map(([name, teachers]) => ({
    name,
    teachers
  }));

  // เรียงลำดับชื่อสาขา (เอา "ไม่ระบุสาขา" ไว้ล่างสุด)
  departmentsList.sort((a, b) => {
    if (a.name === "ไม่ระบุสาขา") return 1;
    if (b.name === "ไม่ระบุสาขา") return -1;
    return a.name.localeCompare(b.name, 'th-TH');
  });

  return (
    <TeacherListView 
      uid={uid}
      admin={admin}
      departmentsList={departmentsList}
      totalTeachers={rawTeachers.length}
    />
  );
}