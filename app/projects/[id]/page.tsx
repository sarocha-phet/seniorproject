import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { 
  FolderOpenIcon, 
  UserGroupIcon, 
  AcademicCapIcon, 
  DocumentTextIcon, 
  ChevronLeftIcon,
  PencilSquareIcon,
  BookOpenIcon,
  CheckCircleIcon,
  ClockIcon,
  ArrowDownTrayIcon,
  PaperClipIcon
} from "@heroicons/react/24/outline";

const getStatusTheme = (status: string) => {
  switch (status) {
    case 'APPROVED': 
    case 'IN_PROGRESS':
      return { label: "กำลังดำเนินงาน", bg: "bg-emerald-100 text-emerald-700 border-emerald-200", dot: "bg-emerald-500" };
    case 'PENDING_APPROVAL':
      return { label: "รออนุมัติหัวข้อ", bg: "bg-amber-100 text-amber-700 border-amber-200", dot: "bg-amber-500" };
    case 'REJECTED':
      return { label: "ต้องแก้ไข", bg: "bg-rose-100 text-rose-700 border-rose-200", dot: "bg-rose-500" };
    default:
      return { label: status || "ไม่มีสถานะ", bg: "bg-slate-100 text-slate-600 border-slate-200", dot: "bg-slate-400" };
  }
};

async function getProjectDetail(id: string) {
  const project = await prisma.project.findUnique({
    where: { id },
    include: {
      subject: true, 
      members: {
        include: { user: true },
      },
      advisors: {
        include: { user: true },
      },
      chapters: true, 
      documents: true 
    },
  })

  if (!project) notFound()
  return project
}

export default async function ProjectDetailPage({ 
  params,
  searchParams
}: { 
  params: Promise<{ id: string }>,
  searchParams: Promise<{ uid?: string; role?: string }> 
}) {
  const { id } = await params;
  const resolvedSearchParams = await searchParams;
  const uid = resolvedSearchParams.uid;
  const currentRole = resolvedSearchParams.role; 
  
  const project = await getProjectDetail(id);
  const theme = getStatusTheme(project.status);

  if (project.members && uid) {
    project.members.sort((a: any, b: any) => {
      if (a.userId === uid) return -1;
      if (b.userId === uid) return 1;
      return 0;
    });
  }

  // กำหนด URL เริ่มต้น
  let backUrl = "/"; 
  let showEditButton = false;

  if (uid && uid !== 'undefined' && uid !== 'null' && uid.trim() !== '') {
    // ✅ 1. ตรวจสอบจากค่า role ที่ส่งมาผ่าน URL
    if (currentRole === 'CHAIR' || currentRole === 'HEAD') {
      backUrl = `/head?uid=${uid}&tab=projects&year=ALL`;
    } else if (currentRole === 'INSTRUCTOR') {
      backUrl = `/instructor?uid=${uid}`;
    } else if (currentRole === 'ADVISOR' || currentRole === 'LECTURER') {
      backUrl = `/lecturer?uid=${uid}`;
    } else if (currentRole === 'STUDENT') {
      backUrl = `/student?uid=${uid}`;
      showEditButton = true;
    } else if (currentRole === 'ADMIN') {
      backUrl = `/admin?uid=${uid}`;
    } else {
      // ✅ 2. ดึงจาก Database เป็นระบบสำรอง (Fallback)
      const currentUser = await prisma.user.findUnique({
        where: { id: uid },
        include: { roles: true }
      });
      
      if (currentUser) {
        const isChair = currentUser.roles.some((r: any) => r.name === 'CHAIR');
        const isAdmin = currentUser.roles.some((r: any) => r.name === 'ADMIN');
        const isInstructor = currentUser.roles.some((r: any) => r.name === 'INSTRUCTOR'); 
        const isAdvisor = currentUser.roles.some((r: any) => ['ADVISOR', 'LECTURER'].includes(r.name)); 
        const isStudent = currentUser.roles.some((r: any) => r.name === 'STUDENT');
        
        if (isAdmin) backUrl = `/admin?uid=${uid}`; 
        else if (isChair) backUrl = `/head?uid=${uid}&tab=projects&year=ALL`;
        else if (isInstructor) backUrl = `/instructor?uid=${uid}`; 
        else if (isAdvisor) backUrl = `/lecturer?uid=${uid}`;       
        else if (isStudent) {
           backUrl = `/student?uid=${uid}`; 
           showEditButton = true; 
        }
        else backUrl = `/?uid=${uid}`;
      }
    }
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] font-sans text-slate-800 pb-12">
      
      {/* --- Header Banner --- */}
      <div className="bg-[#8A151B] pt-12 pb-24 px-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-white opacity-5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-black opacity-10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/4 pointer-events-none"></div>

        <div className="max-w-6xl mx-auto relative z-10">
          
          <Link href={backUrl} className="inline-flex items-center gap-2 text-red-200 hover:text-white transition-colors text-sm font-bold mb-6 bg-white/10 px-4 py-2 rounded-xl backdrop-blur-sm w-fit border border-white/10">
            <ChevronLeftIcon className="w-4 h-4" /> ย้อนกลับไปหน้าแดชบอร์ด
          </Link>

          <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-4">
                <span className="text-xs font-black text-[#8A151B] bg-white px-3 py-1.5 rounded-lg font-mono shadow-sm">
                  {project.projectCode || "รอออกรหัส"}
                </span>
                <span className={`flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-full border bg-white shadow-sm text-slate-700`}>
                  <span className={`w-2 h-2 rounded-full ${theme.dot}`}></span>
                  {theme.label}
                </span>
              </div>
              <h1 className="text-3xl md:text-4xl font-black text-white leading-tight mb-2">
                {project.titleTh}
              </h1>
              <h2 className="text-lg text-red-200 font-medium">
                {project.titleEn || "ยังไม่มีชื่อภาษาอังกฤษ"}
              </h2>
            </div>

            <div className="shrink-0 flex gap-3">
              {showEditButton && (
                <Link 
                  href={`/projects/${project.id}/edit?uid=${uid}&role=${currentRole}`}
                  className="flex items-center gap-2 bg-white text-[#8A151B] hover:bg-slate-100 font-bold py-3 px-6 rounded-2xl transition-all shadow-lg shadow-black/10"
                >
                  <PencilSquareIcon className="w-5 h-5" /> แก้ไขข้อมูล
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* --- Main Content --- */}
      <div className="max-w-6xl mx-auto px-6 -mt-12 relative z-20">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* ================= ซ้าย: รายละเอียดหลัก ================= */}
          <div className="lg:col-span-2 space-y-8">
            
            <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-slate-100">
              <div className="flex items-center gap-3 mb-6 border-b border-slate-100 pb-4">
                <div className="w-10 h-10 bg-red-50 text-[#8A151B] rounded-xl flex items-center justify-center border border-red-100">
                  <BookOpenIcon className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-black text-slate-800">ข้อมูลรายวิชาและรายละเอียด</h3>
              </div>
              
              <div className="grid grid-cols-2 gap-6 mb-8 bg-slate-50 p-6 rounded-2xl border border-slate-100">
                <div>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">รายวิชา</p>
                  <p className="font-bold text-slate-800">{project.subject?.subjectCode || "-"} {project.subject?.nameTh}</p>
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">ปีการศึกษา</p>
                  <p className="font-bold text-slate-800">{project.academicYear || "-"}</p>
                </div>
              </div>

              <div className="space-y-6">
                <div>
                  <p className="text-sm font-bold text-slate-800 flex items-center gap-2 mb-2">
                    <DocumentTextIcon className="w-5 h-5 text-[#8A151B]" /> บทคัดย่อ (Abstract)
                  </p>
                  <p className="text-slate-600 text-sm leading-relaxed bg-slate-50 p-5 rounded-2xl border border-slate-100">
                    {project.abstract || <span className="text-slate-400 italic">ยังไม่มีบทคัดย่อ</span>}
                  </p>
                </div>
                
                <div>
                  <p className="text-sm font-bold text-slate-800 flex items-center gap-2 mb-2">
                    <FolderOpenIcon className="w-5 h-5 text-[#8A151B]" /> ขอบเขตของโครงงาน (Project Scope)
                  </p>
                  <p className="text-slate-600 text-sm leading-relaxed whitespace-pre-line bg-slate-50 p-5 rounded-2xl border border-slate-100">
                   {project.scope || <span className="text-slate-400 italic">ยังไม่ได้ระบุขอบเขต</span>}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-slate-100">
              <div className="flex items-center gap-3 mb-6 border-b border-slate-100 pb-4">
                <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center border border-indigo-100">
                  <PaperClipIcon className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-black text-slate-800">ไฟล์เอกสารแนบ</h3>
              </div>

              {project.documents && project.documents.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* @ts-ignore */}
                  {project.documents.map((doc) => (
                    <div key={doc.id} className="flex flex-col p-4 bg-slate-50 rounded-2xl border border-slate-200 hover:border-indigo-300 hover:shadow-md transition-all group">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <p className="font-bold text-slate-700 text-sm mb-1">{doc.fileType || "เอกสารโครงงาน"}</p>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border
                            ${doc.status === 'APPROVED' ? 'bg-emerald-100 text-emerald-700 border-emerald-200' : 'bg-amber-100 text-amber-700 border-amber-200'}`}>
                            {doc.status || "PENDING"}
                          </span>
                        </div>
                        <div className="p-2 bg-white rounded-lg border border-slate-200 text-slate-400 group-hover:text-indigo-600 group-hover:border-indigo-200 transition-colors">
                          <DocumentTextIcon className="w-5 h-5" />
                        </div>
                      </div>
                      
                      <a 
                        href={doc.filePath} 
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-auto flex items-center justify-center gap-2 text-xs font-bold text-indigo-600 bg-white border border-indigo-100 hover:bg-indigo-50 py-2.5 rounded-xl transition-colors w-full"
                      >
                        <ArrowDownTrayIcon className="w-4 h-4" /> ดาวน์โหลด / ดูไฟล์
                      </a>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                  <DocumentTextIcon className="w-12 h-12 mx-auto text-slate-300 mb-2" />
                  <p className="text-slate-500 font-medium text-sm">ยังไม่มีการอัปโหลดไฟล์เอกสาร</p>
                </div>
              )}
            </div>

            <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-slate-100">
              <div className="flex items-center gap-3 mb-6 border-b border-slate-100 pb-4">
                <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center border border-blue-100">
                  <DocumentTextIcon className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-black text-slate-800">ความคืบหน้าของรายงาน (Chapters)</h3>
              </div>

              {project.chapters && project.chapters.length > 0 ? (
                <div className="space-y-3">
                  {/* @ts-ignore */}
                  {project.chapters.map((chapter) => (
                    <div key={chapter.id} className="flex justify-between items-center p-4 bg-slate-50 rounded-2xl border border-slate-100">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center shadow-sm border border-slate-200 font-black text-slate-700">
                          {chapter.chapterNumber}
                        </div>
                        <div>
                          <span className="font-bold text-slate-700 block text-sm">บทที่ {chapter.chapterNumber}</span>
                          {chapter.title && <span className="text-xs text-slate-500 line-clamp-1">{chapter.title}</span>}
                        </div>
                      </div>
                      <span className={`text-xs font-bold px-3 py-1.5 rounded-full flex items-center gap-1.5 border shrink-0
                        ${chapter.status === 'APPROVED' ? 'text-emerald-700 bg-emerald-50 border-emerald-200' : 'text-amber-700 bg-amber-50 border-amber-200'}`}>
                        {chapter.status === 'APPROVED' ? <CheckCircleIcon className="w-4 h-4" /> : <ClockIcon className="w-4 h-4" />}
                        {chapter.status === 'APPROVED' ? 'ผ่านแล้ว' : 'กำลังดำเนินการ'}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                  <FolderOpenIcon className="w-12 h-12 mx-auto text-slate-300 mb-2" />
                  <p className="text-slate-500 font-medium text-sm">ยังไม่มีการเพิ่มสถานะรายบท</p>
                </div>
              )}
            </div>
            
          </div>

          {/* ================= ขวา: ทีมงาน ================= */}
          <div className="space-y-8">
            
            <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100">
              <h3 className="text-lg font-black text-slate-800 mb-6 flex items-center gap-2">
                <UserGroupIcon className="w-6 h-6 text-[#8A151B]" /> สมาชิกในกลุ่ม
              </h3>
              <ul className="space-y-4">
                {/* @ts-ignore */}
                {project.members && project.members.length > 0 ? project.members.map((m) => {
                  const isMe = m.userId === uid;
                  return (
                    <li key={m.id} className={`flex items-center gap-4 p-3 rounded-2xl border transition-all ${isMe ? 'bg-red-50 border-red-200' : 'bg-slate-50 border-slate-100 hover:bg-white hover:shadow-sm'}`}>
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-lg font-black border shrink-0 ${isMe ? 'bg-white text-[#8A151B] border-red-100' : 'bg-red-50 text-[#8A151B] border-red-100'}`}>
                        {m.user?.firstName?.charAt(0) || "-"}
                      </div>
                      <div className="flex-1 overflow-hidden">
                        <p className="text-sm font-bold text-slate-800 truncate">
                          {m.user?.firstName} {m.user?.lastName} {isMe && <span className="text-[#8A151B] ml-1">(คุณ)</span>}
                        </p>
                        <p className="text-xs font-mono text-slate-500 truncate">{m.user?.username}</p>
                      </div>
                    </li>
                  );
                }) : (
                  <li className="text-center py-4 text-sm text-slate-400 italic">ไม่พบข้อมูลสมาชิก</li>
                )}
              </ul>
            </div>

            <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100">
              <h3 className="text-lg font-black text-slate-800 mb-6 flex items-center gap-2">
                <AcademicCapIcon className="w-6 h-6 text-[#8A151B]" /> อาจารย์ที่ปรึกษา
              </h3>
              <ul className="space-y-4">
                {/* @ts-ignore */}
                {project.advisors && project.advisors.length > 0 ? project.advisors.map((adv) => (
                  <li key={adv.id} className="flex items-center gap-4 p-3 bg-slate-50 rounded-2xl border border-slate-100 hover:bg-white hover:shadow-sm transition-all">
                    <div className="w-12 h-12 rounded-xl bg-orange-50 flex items-center justify-center text-orange-600 text-lg font-black border border-orange-100 shrink-0">
                      {adv.user?.firstName?.charAt(0) || "-"}
                    </div>
                    <div className="flex-1 overflow-hidden">
                      <p className="text-sm font-bold text-slate-800 truncate">อ. {adv.user?.firstName} {adv.user?.lastName}</p>
                      <span className={`inline-block mt-1 text-[10px] font-bold px-2 py-0.5 rounded-md border
                        ${adv.role === 'ADVISOR' ? 'bg-[#8A151B] text-white border-[#8A151B]' : 'bg-slate-200 text-slate-600 border-slate-300'}`}>
                        {adv.role === 'ADVISOR' ? 'ที่ปรึกษาหลัก' : 'ที่ปรึกษาร่วม'}
                      </span>
                    </div>
                  </li>
                )) : (
                  <li className="text-center py-4 text-sm text-slate-400 italic">ยังไม่ระบุอาจารย์ที่ปรึกษา</li>
                )}
              </ul>
            </div>

          </div>
        </div>
      </div>
    </div>
  )
}