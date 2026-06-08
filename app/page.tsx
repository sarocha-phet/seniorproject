import Link from "next/link";
import Image from "next/image";
import { Suspense } from "react";
import { prisma } from "@/lib/prisma";
import ProjectFilterBar from "@/app/components/ProjectFilterBar";
import {
  DocumentTextIcon, CalendarIcon, DocumentDuplicateIcon, CheckBadgeIcon,
  ClockIcon, MegaphoneIcon, EyeIcon, ArrowRightOnRectangleIcon
} from "@heroicons/react/24/outline";

const getStatusConfig = (status: string) => {
  switch (status) {
    case 'APPROVED': return { label: "สอบผ่านแล้ว", badgeClass: "bg-emerald-100 text-emerald-700", bgTint: "bg-emerald-50 border-emerald-100", iconColor: "text-emerald-200 group-hover:text-emerald-400" };
    case 'PENDING_APPROVAL': return { label: "รอดำเนินการ", badgeClass: "bg-amber-100 text-amber-700", bgTint: "bg-amber-50 border-amber-100", iconColor: "text-amber-200 group-hover:text-amber-400" };
    case 'IN_PROGRESS': return { label: "กำลังดำเนินการ", badgeClass: "bg-blue-100 text-blue-700", bgTint: "bg-blue-50 border-blue-100", iconColor: "text-blue-200 group-hover:text-blue-400" };
    case 'REJECTED': return { label: "ไม่ผ่าน", badgeClass: "bg-rose-100 text-rose-700", bgTint: "bg-rose-50 border-rose-100", iconColor: "text-rose-200 group-hover:text-rose-400" };
    default: return { label: status || "ไม่ทราบสถานะ", badgeClass: "bg-slate-100 text-slate-700", bgTint: "bg-slate-50 border-slate-100", iconColor: "text-slate-200 group-hover:text-slate-400" };
  }
};

export default async function OverviewDashboard({ 
  searchParams 
}: { 
  searchParams: { q?: string; status?: string; year?: string; view?: string; subject?: string; major?: string } 
}) {

  const resolvedParams = await searchParams;
  const q = resolvedParams?.q || '';
  const statusFilter = resolvedParams?.status || '';
  const yearFilter = resolvedParams?.year || '';
  const subjectFilter = resolvedParams?.subject || ''; 
  const majorFilter = resolvedParams?.major || ''; 
  const view = resolvedParams?.view || 'grid'; 

  const totalProjects = await prisma.project.count();
  const passedProjects = await prisma.project.count({ where: { status: 'APPROVED' } });
  const passedPercent = totalProjects > 0 ? Math.round((passedProjects / totalProjects) * 100) : 0;

  const whereClause: any = {};
  if (q) {
    whereClause.OR = [
      { titleTh: { contains: q } },
      { titleEn: { contains: q } },
      { members: { some: { user: { firstName: { contains: q } } } } },
      { advisors: { some: { user: { firstName: { contains: q } } } } },
    ];
  }
  if (statusFilter) whereClause.status = statusFilter;
  if (yearFilter) whereClause.academicYear = parseInt(yearFilter);
  if (subjectFilter) whereClause.subjectId = subjectFilter; 
  if (majorFilter) {
    whereClause.subject = {
      major: majorFilter
    };
  }

  const subjects = await prisma.subject.findMany({
    select: { id: true, subjectCode: true, nameTh: true },
    orderBy: { subjectCode: 'asc' }
  });

  const rawMajors = await prisma.subject.findMany({
    select: { major: true },
    distinct: ['major']
  });
  
  const majors = rawMajors.map(s => s.major as string);

  const rawProjects = await prisma.project.findMany({
    where: whereClause,
    include: {
      subject: true, 
      members: { include: { user: true } },
      advisors: { include: { user: true } }
    },
    orderBy: { createdAt: 'desc' }
  });

  const examSubjects = await prisma.subject.findMany({
    where: { finalExamDate: { not: null } },
    orderBy: { finalExamDate: 'asc' } 
  });

  const nextExam = examSubjects[0];
  let displayExamDate = "รอประกาศ";
  let displayExamDetail = "จากอาจารย์ประจำวิชา";

  if (nextExam && nextExam.finalExamDate) {
    const examDate = new Date(nextExam.finalExamDate);
    displayExamDate = examDate.toLocaleDateString('th-TH', { day: 'numeric', month: 'short', year: '2-digit' });
    displayExamDetail = `เวลา ${examDate.toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' })} น.`;
  }

  const displayProjects = rawProjects.map(p => {
    const studentNames = p.members.length > 0 ? p.members.map(m => m.user.firstName).join(', ') : "ไม่มีสมาชิก";
    const mainAdvisor = p.advisors.find(a => a.role === 'ADVISOR')?.user || p.advisors[0]?.user;
    const projectMajor = p.subject?.major || "ไม่ระบุสาขา"; 

    return {
      id: p.id,
      status: p.status,
      major: projectMajor, 
      title: p.titleTh,
      description: p.abstract || "ติดตามความคืบหน้าของโครงงานวิศวกรรมและงานวิจัย",
      studentName: studentNames,
      advisorName: mainAdvisor ? `อ. ${mainAdvisor.firstName}` : "-",
      studentAvatar: null
    };
  });

  const today = new Date().toLocaleDateString('th-TH', { year: 'numeric', month: 'short', day: 'numeric' });

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-800 flex flex-col relative z-0 overflow-x-hidden">
      
      {/* Background Decor */}
      <div className="absolute top-0 left-0 w-full h-[500px] bg-gradient-to-b from-red-100/40 via-red-50/10 to-transparent pointer-events-none -z-10"></div>
      <div className="absolute top-[-5%] right-[-5%] w-[500px] h-[500px] bg-red-200/20 rounded-full blur-[100px] pointer-events-none -z-10"></div>
      <div className="absolute top-[20%] left-[-10%] w-[500px] h-[500px] bg-blue-200/20 rounded-full blur-[100px] pointer-events-none -z-10"></div>

      {/* Navbar / Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50 border-t-4 border-t-[#8A151B] shadow-md transition-all">
        <div className="max-w-[1440px] mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center justify-center shrink-0 bg-white p-1 rounded-full shadow-sm border border-slate-100">
               <Image src="/images/en_ksu.png" alt="Faculty Logo" width={56} height={56} className="object-contain" priority />
            </div>
            <div>
              <h1 className="font-black text-[#8A151B] text-lg md:text-xl leading-tight tracking-tight">
                ระบบจัดการงานวิจัย
              </h1>
              <p className="text-xs font-bold text-slate-500 mt-0.5">
                คณะวิศวกรรมศาสตร์และเทคโนโลยีอุตสาหกรรม
              </p>
            </div>
          </div>

          <div className="hidden md:flex items-center gap-6">
            <div className="flex items-center gap-3 border-l border-slate-200 pl-6">
              <Link href="/login" className="px-8 py-3 bg-[#8A151B] hover:bg-slate-900 text-white text-sm font-black rounded-xl transition-colors shadow-md shadow-red-200 flex items-center gap-2">
                <ArrowRightOnRectangleIcon className="w-5 h-5" /> เข้าสู่ระบบ
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-[1440px] w-full mx-auto px-6 py-10 space-y-8 relative">

        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h2 className="text-3xl font-black text-slate-900 tracking-tight">สรุปภาพรวมปีการศึกษา 2568</h2>
            <p className="text-slate-500 mt-1 text-sm font-bold">ติดตามความคืบหน้าของโครงงานวิศวกรรมและงานวิจัย</p>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 bg-white/60 backdrop-blur-sm border border-slate-200 rounded-full text-xs font-bold text-slate-600 shadow-sm">
            <CalendarIcon className="w-4 h-4" />
            อัปเดตล่าสุด: {today}
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          <div className="bg-gradient-to-br from-white to-slate-100 p-6 rounded-3xl border border-slate-200 shadow-sm flex flex-col justify-between relative overflow-hidden min-w-0 hover:shadow-md transition-shadow">
            <div className="absolute -right-6 -top-6 w-32 h-32 bg-slate-200/40 rounded-full blur-2xl"></div>
            <DocumentDuplicateIcon className="w-16 h-16 text-slate-300 absolute -right-2 -top-2" />
            <p className="text-sm font-bold text-slate-500 relative z-10">โครงงานทั้งหมด</p>
            <p className="text-5xl font-black text-slate-800 mt-4 relative z-10">{totalProjects}</p>
          </div>
          <div className="bg-gradient-to-br from-emerald-50 to-white p-6 rounded-3xl border border-emerald-100 shadow-sm flex flex-col justify-between relative overflow-hidden min-w-0 hover:shadow-md transition-shadow">
            <div className="absolute -right-6 -top-6 w-32 h-32 bg-emerald-200/40 rounded-full blur-2xl"></div>
            <CheckBadgeIcon className="w-16 h-16 text-emerald-200 absolute -right-2 -top-2" />
            <p className="text-sm font-bold text-emerald-700 relative z-10">สอบผ่านแล้ว</p>
            <div className="flex items-center gap-4 mt-4 relative z-10">
              <p className="text-5xl font-black text-slate-800">{passedProjects}</p>
              <div className="flex-1 h-2 bg-emerald-100/50 rounded-full overflow-hidden"><div className="h-full bg-emerald-500 rounded-full" style={{ width: `${passedPercent}%` }}></div></div>
            </div>
          </div>
          <div className="bg-gradient-to-br from-[#8A151B] to-[#b71c22] p-6 rounded-3xl shadow-lg shadow-red-200/50 flex flex-col justify-between relative overflow-hidden text-white min-w-0">
            <MegaphoneIcon className="w-24 h-24 text-red-500 absolute -right-4 -top-4 opacity-50" />
            <p className="text-sm font-bold text-red-100 relative z-10">กำหนดการสอบครั้งถัดไป</p>
            <div className="mt-4 relative z-10">
              <p className="text-3xl font-black truncate">{displayExamDate}</p>
              <p className="text-sm text-red-100 mt-1 font-medium truncate">{displayExamDetail}</p>
            </div>
          </div>
        </div>

        {/* Announcements */}
        <div className="mt-8 bg-white/80 backdrop-blur-sm p-8 rounded-[2rem] shadow-sm border border-slate-100 overflow-hidden">
          <h3 className="text-lg font-black text-slate-800 mb-6 flex items-center gap-2"><MegaphoneIcon className="w-6 h-6 text-[#8A151B]" /> ประกาศวันสอบรายวิชา</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {examSubjects && examSubjects.length > 0 ? (
              examSubjects.map((sub) => (
                <div key={sub.id} className="p-5 bg-white rounded-[1.5rem] border border-slate-200 border-l-4 border-l-[#8A151B] hover:shadow-md transition-all group min-w-0">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{sub.subjectCode}</p>
                  <h4 className="font-bold text-slate-800 truncate mb-4 group-hover:text-[#8A151B] transition-colors">{sub.nameTh}</h4>
                  <div className="flex justify-between items-center text-xs font-bold text-[#8A151B] bg-red-50 p-3 rounded-xl border border-red-100">
                    <span className="flex items-center gap-1.5 whitespace-nowrap">วันสอบ: {new Date(sub.finalExamDate!).toLocaleDateString('th-TH')}</span>
                    <span className="flex items-center gap-1.5 whitespace-nowrap border-l border-red-200 pl-3 ml-3">{new Date(sub.finalExamDate!).toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' })} น.</span>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-full py-12 text-center bg-slate-50/50 rounded-[1.5rem] border border-dashed border-slate-200"><p className="text-slate-400 font-bold text-sm">ยังไม่มีการประกาศวันสอบในขณะนี้</p></div>
            )}
          </div>
        </div>

        <Suspense fallback={<div className="h-16 bg-white rounded-2xl animate-pulse"></div>}>
           <ProjectFilterBar subjects={subjects} majors={majors} />
        </Suspense>

        {/* Project Grid */}
        <div className={view === 'list' ? "flex flex-col gap-4" : "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"}>
          {displayProjects.length > 0 ? (
            displayProjects.map((project) => {
              const statusConfig = getStatusConfig(project.status);

              return (
                <div key={project.id} className={`bg-white/90 backdrop-blur-sm border border-slate-200 rounded-3xl overflow-hidden hover:shadow-xl hover:border-slate-300 transition-all flex group relative ${view === 'list' ? 'flex-col sm:flex-row p-4 gap-4 sm:gap-6 sm:items-center' : 'flex-col'}`}>
                  <div className={`${statusConfig.bgTint} flex items-center justify-center relative ${view === 'list' ? 'w-24 h-24 rounded-2xl shrink-0 border' : 'h-40 p-4 border-b'}`}>
                    <DocumentTextIcon className={`${view === 'list' ? 'w-10 h-10' : 'w-16 h-16'} ${statusConfig.iconColor} transition-colors`} />
                  </div>
                  <div className={`flex flex-col flex-1 ${view === 'list' ? 'py-2 sm:flex-row items-center' : 'p-6'}`}>
                    <div className={view === 'list' ? "flex-1 pr-0 sm:pr-6 w-full" : ""}>
                       <div className="flex justify-between items-start mb-2">
                          <p className="text-[10px] font-black text-[#8A151B] tracking-wider uppercase">{project.major}</p>
                          {view === 'list' && (<div className={`px-3 py-1 rounded-full text-[10px] font-black tracking-widest uppercase ${statusConfig.badgeClass}`}>{statusConfig.label}</div>)}
                       </div>
                       <Link href={`/projects/${project.id}`} className="block group/link mb-2">
                          <h3 className="font-bold text-slate-900 text-lg leading-snug line-clamp-2 group-hover/link:text-[#8A151B] transition-colors">
                            {project.title}
                            <EyeIcon className="inline-block w-5 h-5 ml-2 text-slate-300 group-hover/link:text-[#8A151B] opacity-0 group-hover/link:opacity-100 transition-opacity" />
                          </h3>
                       </Link>
                       <p className={`text-xs text-slate-500 font-medium line-clamp-2 ${view === 'list' ? 'mb-4 sm:mb-0' : 'mb-6 flex-1'}`}>{project.description}</p>
                    </div>
                    <div className={`${view === 'list' ? 'w-full sm:w-64 shrink-0 sm:pl-6 sm:border-l border-slate-100 flex items-center gap-3' : 'flex items-center gap-3 pt-4 border-t border-slate-100 mt-auto'}`}>
                      <div className="w-10 h-10 rounded-full bg-slate-100 border border-slate-200 overflow-hidden flex items-center justify-center shrink-0">
                        <span className="text-slate-400 font-black text-sm uppercase">{project.studentName.charAt(0)}</span>
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-bold text-slate-800 leading-tight truncate">{project.studentName}</p>
                        <p className="text-[10px] text-slate-500 font-bold truncate">ที่ปรึกษา: <span className="text-slate-600">{project.advisorName}</span></p>
                      </div>
                    </div>
                  </div>
                  {view === 'grid' && (
                    <div className={`absolute top-4 right-4 px-3 py-1 rounded-full text-[10px] font-black tracking-widest uppercase z-10 ${statusConfig.badgeClass}`}>{statusConfig.label}</div>
                  )}
                </div>
              );
            })
          ) : (
            <div className="col-span-full py-16 text-center text-slate-500 bg-white/60 backdrop-blur-sm border border-dashed border-slate-300 rounded-[2rem]">
              <DocumentTextIcon className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <p className="font-bold text-slate-600">ไม่พบข้อมูลโครงงาน</p>
              <p className="text-sm">ลองปรับเปลี่ยนคำค้นหา หรือตัวกรองสถานะด้านบน</p>
            </div>
          )}
        </div>
      </main>

      <footer className="bg-white/80 backdrop-blur-md border-t border-slate-200 py-6 mt-auto">
        <div className="max-w-[1440px] mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-xs font-bold text-slate-400">© {new Date().getFullYear() + 543} คณะวิศวกรรมศาสตร์และเทคโนโลยีอุตสาหกรรม มหาวิทยาลัยกาฬสินธุ์</p>
        </div>
      </footer>
    </div>
  );
}