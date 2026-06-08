import { Suspense } from 'react'
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import ProjectFilterBar from "@/app/components/ProjectFilterBar";
import Link from "next/link";
import { 
  ChevronLeftIcon,
  RectangleStackIcon,
  UserIcon,
  AcademicCapIcon,
  BookOpenIcon,
  FolderIcon,
} from "@heroicons/react/24/outline";

export default async function AdminProjectsPage({ 
  searchParams 
}: { 
  searchParams: {uid?: string; q?: string; status?: string; subject?: string} 
}) {
 const resolvedParams = await searchParams;
  const uid = resolvedParams.uid;
  const query = resolvedParams.q || "";
  const status = resolvedParams.status || "";
  const subjectId = resolvedParams.subject || "";

  if (!uid) redirect('/login');

  const admin = await prisma.user.findUnique({
    where: { id: uid },
    include: { roles: true }
  });
  const isAdmin = admin?.roles?.some((r) => r.name === 'ADMIN');
  if (!admin || !isAdmin) redirect('/login');

  const allSubjects = await prisma.subject.findMany({
    select: { id: true, subjectCode: true, nameTh: true },
    orderBy: { subjectCode: 'asc' }
  });
 const rawMajors = await prisma.subject.findMany({
    select: { major: true },
    distinct: ['major']
  });

  const majorsList = rawMajors.map(s => s.major as string).filter(Boolean);

  const projectCondition: any = {};
  if (query) {
    projectCondition.OR = [
      { titleTh: { contains: query } },
      { titleEn: { contains: query } },
    ];
  }
  if (status) {
    projectCondition.status = status;
  }

  const subjectCondition: any = {};
  if (subjectId) {
    subjectCondition.id = subjectId;
  }

  const subjectsWithProjects = await prisma.subject.findMany({
    where: {
      ...subjectCondition,
      projects: {
        some: projectCondition
      }
    },
    include: {
      projects: {
        where: projectCondition,
        include: {
          members: { include: { user: true } },
          advisors: { include: { user: true } }
        }
      }
    },
    orderBy: { subjectCode: 'asc' }
  });

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center py-10 px-4 font-sans text-slate-900 overflow-x-hidden">
      <div className="w-full max-w-[1200px] space-y-10">
        
        {/* --- Header --- */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="min-w-0 flex-1">
            <Link href={`/admin?uid=${uid}`} className="inline-flex items-center gap-2 text-slate-500 hover:text-[#8A151B] transition-colors text-sm font-bold mb-4">
              <ChevronLeftIcon className="w-4 h-4" /> กลับไปหน้าแผงควบคุม
            </Link>
            <h1 className="text-3xl font-black text-[#4A151B] flex items-center gap-3 truncate">
              <RectangleStackIcon className="w-10 h-10 text-[#8A151B] shrink-0" />
              โครงงานวิจัยทั้งหมด
            </h1>
            <p className="text-slate-600 mt-1 font-medium">ติดตามความคืบหน้าโครงงานวิจัยแยกตามรายวิชา</p>
          </div>
        </div>

       {/* --- Search & Filter Bar --- */}
        <Suspense fallback={<div className="h-16 bg-white rounded-2xl animate-pulse border border-slate-100 shadow-sm"></div>}>
          <ProjectFilterBar subjects={allSubjects} majors={majorsList} />
        </Suspense>

        {/* --- รายการโครงงานแยกตามรายวิชา --- */}
        <div className="space-y-16">
          {subjectsWithProjects.map((subject: any) => (
            <div key={subject.id} className="space-y-6">
             {/* Subject Header Label */}
              <div className="flex items-center gap-3 bg-gradient-to-r from-[#8A151B] to-[#A31D24] w-fit px-6 py-2.5 rounded-2xl shadow-md border border-[#7A1218]">
                <BookOpenIcon className="w-5 h-5 text-red-100" />
                <span className="text-sm font-black text-white uppercase tracking-tight">{subject.subjectCode}</span>
                <span className="text-sm font-bold text-red-300">|</span>
                <span className="text-sm font-black text-red-50">{subject.nameTh}</span>
                <span className="ml-2 bg-white text-[#8A151B] text-[10px] px-2.5 py-1 rounded-lg font-black uppercase shadow-sm">
                  {subject.projects.length} โครงงาน
                </span>
              </div>

             {/* Projects Grid */}
              <div className="grid grid-cols-1 gap-5 mt-2">
                {subject.projects.map((project: any) => (
                  <div key={project.id} className="bg-white hover:bg-gradient-to-br hover:from-white hover:to-red-50/40 rounded-[2.5rem] p-8 border border-slate-200 hover:border-red-200 shadow-sm hover:shadow-lg transition-all duration-300 group relative overflow-hidden">
                    <div className="flex flex-col lg:flex-row gap-8 items-start lg:items-center">
                      
                      {/* ข้อมูลชื่อโครงงาน */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-3">
                            <span className={`text-[10px] font-black px-2.5 py-1 rounded-md uppercase border ${
                                project.status === 'APPROVED' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                                'bg-amber-50 text-amber-700 border-amber-200'
                            }`}>
                                {project.status}
                            </span>
                        </div>
                        <Link href={`/admin/projects/${project.id}?uid=${uid}`} className="block cursor-pointer">
                          <h3 className="text-xl font-black text-slate-950 group-hover:text-[#8A151B] hover:underline transition-colors leading-tight">
                            {project.titleTh}
                          </h3>
                          <p className="text-sm font-bold text-slate-500 italic mt-1 tracking-tight uppercase group-hover:text-[#8A151B]">
                            {project.titleEn}
                          </p>
                        </Link>
                      </div>

                      {/* ส่วนคณะผู้จัดทำ & อาจารย์ที่ปรึกษา */}
                      <div className="flex flex-wrap gap-x-12 gap-y-6 shrink-0 lg:border-l lg:pl-10 border-slate-100">
                        
                        {/* คณะผู้จัดทำ */}
                        <div className="space-y-3 min-w-[160px]">
                          <p className="text-xs font-semibold text-slate-600 uppercase tracking-widest flex items-center gap-2 border-b border-slate-100 pb-2">
                            <UserIcon className="w-4 h-4 text-slate-400" /> คณะผู้จัดทำ
                          </p>
                          <div className="space-y-1.5 pl-1">
                            {project.members.map((m: any) => (
                              <p key={m.userId} className="text-xs font-black text-slate-900 leading-none">
                                • {m.user.firstName} {m.user.lastName}
                              </p>
                            ))}
                          </div>
                        </div>

                        {/* อาจารย์ที่ปรึกษา */}
                        <div className="space-y-3 min-w-[180px]">
                          <p className="text-xs font-semibold text-slate-600 uppercase tracking-widest flex items-center gap-2 border-b border-slate-100 pb-2">
                            <AcademicCapIcon className="w-4 h-4 text-slate-400" /> อาจารย์ที่ปรึกษา
                          </p>
                          <div className="space-y-1.5 pl-1">
                            {project.advisors.map((adv: any) => (
                              <p key={adv.userId} className="text-xs font-black text-[#8A151B] leading-none">
                                {adv.user.firstName} {adv.user.lastName}
                                <span className="text-[10px] ml-2 font-medium text-slate-500">({adv.role})</span>
                              </p>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}

          {/* กรณีไม่พบข้อมูล */}
          {subjectsWithProjects.length === 0 && (
            <div className="py-24 text-center bg-white rounded-[3rem] border border-dashed border-slate-200">
                <FolderIcon className="w-20 h-20 text-slate-100 mx-auto mb-4" />
                <p className="text-slate-400 font-bold text-lg">ไม่พบข้อมูลโครงงานวิจัยที่ต้องการค้นหา</p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}