'use client' 

import { logoutAction } from "@/app/login/actions";
import NotificationBell from "@/app/components/NotificationBell";
import Link from "next/link";
import Image from "next/image";
import { 
  HomeIcon, 
  CalendarDaysIcon, 
  DocumentArrowUpIcon, 
  UserCircleIcon,
  ArrowRightOnRectangleIcon,
  AcademicCapIcon,
  ClipboardDocumentListIcon,
  DocumentCheckIcon,
  EyeIcon,
  ArrowRightIcon,
  DocumentTextIcon,
  DocumentMagnifyingGlassIcon,
  ClockIcon
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

const formatTeacherName = (user: any) => {
  if (!user) return "ยังไม่ระบุ";
  let prefix = user.academicRank || user.phdTitle || user.titlePrefix || "อ.";
  return `${prefix} ${user.firstName} ${user.lastName}`.trim();
};

// --- Main View Component ---

export default function StudentDashboardView({ 
  user, 
  activeProject, 
  availableSubjects, 
  currentSubject, 
  notifications, 
  uid,
  displayYear 
}: any) {

  const handleLogout = async () => {
    if (confirm("คุณต้องการออกจากระบบใช่หรือไม่?")) {
      try {
        await logoutAction();
        window.location.href = "/"; 
      } catch (error) {
        console.error("Logout failed:", error);
        window.location.href = "/";
      }
    }
  };

  return (
    <div className="flex h-screen bg-[#F8FAFC] font-sans text-slate-800 overflow-hidden">
      
      {/* SIDEBAR */}
      <aside className="w-64 bg-white border-r border-slate-200 flex flex-col shadow-[4px_0_24px_rgba(0,0,0,0.02)] z-20 hidden lg:flex shrink-0">
        

        <div className="h-24 flex items-center px-6 border-b border-slate-100 gap-3">
          <div className="w-11 h-11 bg-white rounded-full flex items-center justify-center shadow-sm overflow-hidden p-0.5 border border-red-100 shrink-0">
            <Image src="/images/en_ksu.png" alt="KSU Logo" width={44} height={44} className="object-contain" priority />
          </div>
          <div>
            <h1 className="font-bold text-[#8A151B] text-sm leading-tight">ระบบจัดการนักศึกษา</h1>
            <p className="text-[10px] text-slate-700 mt-0.5">มหาวิทยาลัยกาฬสินธุ์</p>
          </div>
        </div>

      <nav className="flex-1 px-4 py-8 space-y-2 overflow-y-auto">
          <p className="text-xs font-bold text-slate-400 px-4 mb-4 uppercase tracking-wider">เมนูหลัก</p>
          <Link href={`/student?uid=${uid}`}className="flex items-center gap-3 px-4 py-3 bg-red-50 text-[#8A151B] rounded-2xl font-bold transition-all relative">
             <div className="absolute left-0 top-2 bottom-2 w-1 bg-[#8A151B] rounded-r-full"></div>
            <CalendarDaysIcon className="w-5 h-5" /> แผงควบคุม (Dashboard)
          </Link>
          <Link href={`/projects/create?uid=${uid}`} className="flex items-center gap-3 px-4 py-3 text-slate-500 hover:text-[#8A151B] hover:bg-red-50/50 rounded-2xl font-bold transition-all">
            <ClipboardDocumentListIcon className="w-5 h-5" /> เสนอหัวข้อ (Proposal)
          </Link>
          <Link href={`/student/meetings?uid=${uid}`} className="flex items-center gap-3 px-4 py-3 text-slate-500 hover:text-[#8A151B] hover:bg-red-50/50 rounded-2xl font-bold transition-all">
            <CalendarDaysIcon className="w-5 h-5" /> บันทึกเข้าพบ (Meetings)
          </Link>
          <Link href={`/student/documents?uid=${uid}`} className="flex items-center gap-3 px-4 py-3 text-slate-500 hover:text-[#8A151B] hover:bg-red-50/50 rounded-2xl font-bold transition-all">
            <DocumentArrowUpIcon className="w-5 h-5" /> ส่งเอกสาร (Documents)
          </Link>
          <Link href={`/student/proposal-exam-request?uid=${uid}`} className="flex items-center gap-3 px-4 py-3 text-slate-500 hover:text-[#8A151B] hover:bg-red-50/50 rounded-2xl font-bold transition-all">
            <DocumentMagnifyingGlassIcon className="w-5 h-5" /> ขอสอบเค้าโครง (Proposal Exam)
          </Link>
          <Link href={`/student/exam-request?uid=${uid}`} className="flex items-center gap-3 px-4 py-3 text-slate-500 hover:text-[#8A151B] hover:bg-red-50/50 rounded-2xl font-bold transition-all">
            <DocumentCheckIcon className="w-5 h-5" /> ขอสอบโครงงาน (Final Exam)
          </Link>
        </nav>

        <div className="p-4 border-t border-slate-100">
          <button 
            type="button"
            onClick={handleLogout} 
            className="w-full flex items-center justify-center gap-2 py-3 bg-[#CC1E24] hover:bg-[#A3161A] text-white rounded-xl font-bold transition-all shadow-md shadow-red-200">
            <ArrowRightOnRectangleIcon className="w-5 h-5" /> ออกจากระบบ
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        <header className="bg-gradient-to-r from-[#8A151B] to-[#b71c22] h-20 px-8 flex items-center justify-between shadow-md shrink-0 z-10 text-white">
          <div>
            <h2 className="text-lg font-bold">ยินดีต้อนรับ, {user.firstName}! 👋</h2>
            <p className="text-xs text-red-200">ปีการศึกษา {displayYear} • คณะวิศวกรรมศาสตร์ฯ</p>
          </div>
          <div className="flex items-center gap-5">
            <NotificationBell notifications={notifications} />
            <div className="flex items-center gap-3 pl-5 border-l border-red-800/50">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-bold">{user.firstName} {user.lastName}</p>
                <p className="text-[10px] text-red-200 uppercase">{user.username}</p>
              </div>
              <div className="w-10 h-10 rounded-full bg-white text-[#8A151B] flex items-center justify-center font-black text-lg shadow-sm border-2 border-red-300">
                {user.firstName.charAt(0)}
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-6 lg:p-10 space-y-8">
          {!activeProject ? (
            <div className="max-w-4xl mx-auto mt-10 space-y-8">
              <div className="text-center mb-10">
                <AcademicCapIcon className="w-16 h-16 text-[#8A151B] mx-auto mb-4" />
                <h2 className="text-3xl font-black text-slate-800 mb-2">เลือกรายวิชาโครงงาน</h2>
                <p className="text-slate-500">กรุณาเลือกรายวิชาที่คุณกำลังศึกษาอยู่</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {availableSubjects.map((subject: any) => (
                  <div key={subject.id} className="bg-white rounded-[2rem] p-8 shadow-sm border border-slate-200 hover:border-[#8A151B] transition-all group">
                    <span className="inline-block px-3 py-1 bg-slate-100 text-slate-600 text-xs font-black rounded-lg mb-4">{subject.subjectCode}</span>
                    <h3 className="text-xl font-black text-slate-900 mb-2">{subject.nameTh}</h3>
                    <p className="text-sm font-bold text-slate-500 mb-6 italic">{subject.nameEn}</p>
                    <div className="pt-6 border-t border-slate-100 flex items-center justify-between">
                       <div className="text-xs font-bold text-slate-400 uppercase">ปีการศึกษา {subject.academicYear}</div>
                       <Link href={`/projects/create?uid=${uid}&subjectId=${subject.id}`} className="flex items-center gap-2 px-5 py-2.5 bg-red-50 text-[#8A151B] font-black text-sm rounded-xl group-hover:bg-[#8A151B] group-hover:text-white transition-all">
                          เลือกวิชานี้ <ArrowRightIcon className="w-4 h-4" />
                       </Link>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="space-y-8 max-w-6xl mx-auto">
              {/* รายละเอียดโครงงาน */}
              <div className="bg-white rounded-[2.5rem] p-8 lg:p-10 shadow-sm border border-slate-100 relative overflow-hidden">
                <div className="absolute left-0 top-0 bottom-0 w-2.5 bg-[#8A151B]"></div>
                <div className="flex flex-col lg:flex-row justify-between lg:items-center gap-6">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-4">
                      <span className="text-xs font-black text-slate-500 bg-slate-100 px-3 py-1.5 rounded-lg font-mono">{activeProject.projectCode || "รอออกรหัส"}</span>
                      <span className={`flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-full border ${getStatusTheme(activeProject.status).bg}`}>
                        <span className={`w-2 h-2 rounded-full ${getStatusTheme(activeProject.status).dot}`}></span>
                        {getStatusTheme(activeProject.status).label}
                      </span>
                    </div>
                    <h3 className="text-2xl lg:text-3xl font-black text-slate-900 mb-2 leading-tight">{activeProject.titleTh}</h3>
                    <p className="text-sm text-slate-500 mb-6">{activeProject.titleEn}</p>
                    <div className="flex items-center gap-2">
                      <AcademicCapIcon className="w-5 h-5 text-blue-600" />
                      <div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase">ที่ปรึกษาหลัก</p>
                        <p className="text-sm font-bold text-slate-700">{formatTeacherName(activeProject.advisors.find((a: any) => a.role === 'ADVISOR')?.user)}</p>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col sm:flex-row lg:flex-col gap-3">
                    <Link href={`/projects/${activeProject.id}?uid=${uid}&role=STUDENT`} className="flex items-center justify-center gap-2 px-6 py-3.5 bg-slate-900 text-white rounded-2xl font-bold text-sm hover:bg-[#8A151B]">
                      <EyeIcon className="w-5 h-5" /> ดูรายละเอียด
                    </Link>
                    <Link href={`/student/meetings?uid=${uid}`} className="flex items-center justify-center gap-2 px-6 py-3.5 border rounded-2xl font-bold text-sm hover:bg-slate-50">
                      <CalendarDaysIcon className="w-5 h-5" /> บันทึกเข้าพบ
                    </Link>
                  </div>
                </div>
              </div>

              {/* Grid 3 คอลัมน์ */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white rounded-[2rem] p-6 shadow-sm border border-slate-100 flex items-center gap-5">
                  <CalendarDaysIcon className="w-12 h-12 text-orange-600 bg-orange-50 p-2.5 rounded-2xl" />
                  <div>
                    <h4 className="text-xs font-bold text-slate-500">การเข้าพบที่ปรึกษา</h4>
                    <p className="text-2xl font-black text-slate-900">{activeProject.meetingLogs.length} <span className="text-xs text-slate-400">/ 12 ครั้ง</span></p>
                  </div>
                </div>
                <div className="bg-white rounded-[2rem] p-6 shadow-sm border border-slate-100 flex items-center gap-5">
                  <DocumentTextIcon className="w-12 h-12 text-blue-600 bg-blue-50 p-2.5 rounded-2xl" />
                  <div>
                    <h4 className="text-xs font-bold text-slate-500">ส่งรายงานล่าสุด</h4>
                    <p className="text-lg font-black text-slate-800">รอการอัปเดต</p>
                  </div>
                </div>
                <div className="bg-white rounded-[2rem] p-6 shadow-sm border border-slate-100 flex items-center gap-5">
                  <ClockIcon className="w-12 h-12 text-purple-600 bg-purple-50 p-2.5 rounded-2xl" />
                  <div>
                    <h4 className="text-xs font-bold text-slate-500">วันสอบไฟนอล</h4>
                    <p className="text-lg font-black text-slate-800">
                      {currentSubject?.finalExamDate ? new Date(currentSubject.finalExamDate).toLocaleDateString('th-TH', { day: 'numeric', month: 'short' }) : 'รอประกาศ'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}