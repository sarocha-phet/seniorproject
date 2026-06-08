import { prisma } from "@/lib/prisma";
import Link from "next/link";
import CreateProjectForm from "./CreateProjectForm"; // ✅ เรียกใช้ฟอร์มใหม่
import { 
  ClipboardDocumentListIcon, 
  ChevronLeftIcon
} from "@heroicons/react/24/outline";

export default async function CreateProjectPage({ 
  searchParams 
}: { 
  searchParams: { uid?: string; subjectId?: string } 
}) {
  const resolvedParams = await searchParams;
  const uid = resolvedParams.uid;
  const subjectId = resolvedParams.subjectId;

  // 1. ดึงข้อมูลนักศึกษา
  const students = await prisma.user.findMany({
    where: { roles: { some: { name: 'STUDENT' } } },
    include: { projects: true },
    orderBy: { firstName: 'asc' }
  });

  // 2. ดึงข้อมูลอาจารย์ที่ปรึกษา
  const lecturers = await prisma.user.findMany({
    where: { roles: { some: { name: 'ADVISOR' } } },
    orderBy: { firstName: 'asc' }
  });

  // 3. ดึงข้อมูลประธานหลักสูตร
  const chairs = await prisma.user.findMany({
    where: { roles: { some: { name: 'CHAIR' } } }
  });
  const chairPerson = chairs.length > 0 ? chairs[0] : null;

  // 4. ระบุตัวตนผู้ใช้ปัจจุบัน
  const currentUser = students.find(s => s.id === uid);

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col items-center py-10 px-4 font-sans">
      <div className="w-full max-w-4xl bg-white shadow-[0_10px_40px_rgba(0,0,0,0.08)] rounded-[2.5rem] overflow-hidden border border-slate-100">
        
        {/* --- Header --- */}
        <div className="bg-[#8A151B] px-8 py-8 text-white">
          <div className="flex justify-between items-center mb-2">
            <Link href={`/student?uid=${uid}`} className="flex items-center gap-1 text-red-100 hover:text-white transition text-sm">
              <ChevronLeftIcon className="w-4 h-4" /> ย้อนกลับ
            </Link>
            <span className="text-red-200/50 text-xs font-mono uppercase tracking-widest">New Proposal</span>
          </div>
          <h1 className="text-3xl font-black flex items-center gap-3">
            <ClipboardDocumentListIcon className="w-10 h-10" />
            เสนอหัวข้อโครงงานใหม่
          </h1>
        </div>

        {/* ✅ แสดงฟอร์ม Client Component แทน */}
        <CreateProjectForm 
          uid={uid} 
          currentUser={currentUser} 
          students={students} 
          lecturers={lecturers} 
          chairPerson={chairPerson} 
          subjectId={subjectId}
        />
        
      </div>
    </div>
  );
}