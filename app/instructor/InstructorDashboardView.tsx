'use client'

import Link from "next/link";
import Image from "next/image";
import { approveByInstructor } from "./actions";
import { logoutAction } from "@/app/login/actions";
import {
  HomeIcon,
  ClipboardDocumentCheckIcon,
  ArrowRightOnRectangleIcon,
  CheckCircleIcon,
  BellAlertIcon,
  DocumentTextIcon,
  QueueListIcon,
  BellIcon,
  UserCircleIcon,
  AcademicCapIcon,
  FolderOpenIcon,
  BookOpenIcon,
  PlusIcon,
  FunnelIcon,
  ArrowDownTrayIcon
} from "@heroicons/react/24/outline";

const getStatusTheme = (status: string) => {
  switch (status) {
    case 'APPROVED':
    case 'IN_PROGRESS':
      return { label: "กำลังดำเนินงาน", bg: "bg-emerald-50 text-emerald-600 border-emerald-200", dot: "bg-emerald-500" };
    case 'PENDING_INSTRUCTOR':
    case 'PENDING_APPROVAL':
      return { label: "รออนุมัติหัวข้อ", bg: "bg-amber-50 text-amber-600 border-amber-200", dot: "bg-amber-500" };
    case 'REJECTED':
      return { label: "ไม่ผ่าน/ต้องแก้ไข", bg: "bg-rose-50 text-rose-600 border-rose-200", dot: "bg-rose-500" };
    default:
      return { label: status, bg: "bg-slate-50 text-slate-600 border-slate-200", dot: "bg-slate-400" };
  }
};

const formatTeacherName = (user: any) => {
  if (!user) return "ไม่ระบุ";
  const rank = user.academicRank ? user.academicRank : "อ.";
  const phd = user.phdTitle ? user.phdTitle : "";
  return `${rank}${phd} ${user.firstName} ${user.lastName}`.trim();
};

export default function InstructorDashboardView({
  uid,
  currentTab,
  selectedYear,
  instructor,
  subjects,
  filteredProjects,
  activeProjects,
  pendingTopics,
  notifications,
  rawLogs
}: any) {

  const handleLogout = async () => {
    if (window.confirm("คุณต้องการออกจากระบบใช่หรือไม่?")) {
      try {
        await logoutAction();
        window.location.href = '/';
      } catch (error) {
        window.location.href = '/';
      }
    }
  };

  const actionHistory = rawLogs ? rawLogs.map((log: any) => {
    let actionTitle = "อัปเดตข้อมูล";
    if (log.action === 'APPROVED_TOPIC') actionTitle = "✅ อนุมัติหัวข้อโครงงานแล้ว";
    return {
        id: log.id,
        action: log.action,
        title: actionTitle,
        projectCode: log.project?.projectCode || 'รอออกรหัส',
        date: log.createdAt,
        details: log.details || "ไม่มีรายละเอียด"
    };
  }) : [];

  return (
    <div className="flex h-screen bg-[#F8FAFC] font-sans text-slate-800 overflow-hidden">

      {/* ================= SIDEBAR ================= */}
      <aside className="w-64 bg-[#FFFDFC] border-r border-red-50 flex flex-col shadow-[4px_0_24px_rgba(0,0,0,0.02)] z-20 hidden lg:flex shrink-0">
        <div className="h-24 flex items-center px-6 border-b border-red-50 gap-3">
          <div className="w-11 h-11 bg-white rounded-full flex items-center justify-center shadow-sm overflow-hidden p-0.5 border border-red-100 shrink-0">
            <Image src="/images/en_ksu.png" alt="KSU Logo" width={44} height={44} className="object-contain" priority />
          </div>
          <div>
            <h1 className="font-bold text-[#8A151B] text-sm leading-tight">ระบบจัดการอาจารย์</h1>
            <p className="text-[10px] text-slate-700">ประจำวิชา</p>
          </div>
        </div>

        <nav className="flex-1 px-4 py-8 space-y-2 overflow-y-auto">
          <p className="text-xs font-bold text-slate-400 px-4 mb-4 uppercase tracking-wider">เมนูหลัก</p>

          <Link href={`?uid=${uid}&tab=overview&year=${selectedYear}`} className={`flex items-center gap-3 px-4 py-3.5 rounded-2xl font-bold transition-all ${currentTab === 'overview' ? 'bg-red-50 text-[#8A151B] shadow-sm relative' : 'text-slate-500 hover:text-[#8A151B] hover:bg-red-50/50'}`}>
            {currentTab === 'overview' && <div className="absolute left-0 top-2 bottom-2 w-1 bg-[#8A151B] rounded-r-full"></div>}
            <HomeIcon className="w-5 h-5" /> ภาพรวมโครงงาน
          </Link>

          <Link href={`?uid=${uid}&tab=subjects&year=${selectedYear}`} className={`flex items-center gap-3 px-4 py-3.5 rounded-2xl font-bold transition-all ${currentTab === 'subjects' ? 'bg-red-50 text-[#8A151B] shadow-sm relative' : 'text-slate-500 hover:text-[#8A151B] hover:bg-red-50/50'}`}>
            {currentTab === 'subjects' && <div className="absolute left-0 top-2 bottom-2 w-1 bg-[#8A151B] rounded-r-full"></div>}
            <BookOpenIcon className="w-5 h-5" /> จัดการรายวิชา
          </Link>

          <Link href={`?uid=${uid}&tab=approvals&year=${selectedYear}`} className={`flex items-center justify-between px-4 py-3.5 rounded-2xl font-bold transition-all ${currentTab === 'approvals' ? 'bg-red-50 text-[#8A151B] shadow-sm relative' : 'text-slate-500 hover:text-[#8A151B] hover:bg-red-50/50'}`}>
            {currentTab === 'approvals' && <div className="absolute left-0 top-2 bottom-2 w-1 bg-[#8A151B] rounded-r-full"></div>}
            <div className="flex items-center gap-3">
              <BellAlertIcon className="w-5 h-5" /> พิจารณาอนุมัติ
            </div>
            {pendingTopics.length > 0 && <span className="bg-red-100 text-red-600 py-0.5 px-2 rounded-full text-[10px]">{pendingTopics.length}</span>}
          </Link>

          <Link href={`?uid=${uid}&tab=history&year=${selectedYear}`} className={`flex items-center gap-3 px-4 py-3.5 rounded-2xl font-bold transition-all ${currentTab === 'history' ? 'bg-red-50 text-[#8A151B] shadow-sm relative' : 'text-slate-500 hover:text-[#8A151B] hover:bg-red-50/50'}`}>
            {currentTab === 'history' && <div className="absolute left-0 top-2 bottom-2 w-1 bg-[#8A151B] rounded-r-full"></div>}
            <QueueListIcon className="w-5 h-5" /> ประวัติการดำเนินการ
          </Link>
        </nav>

        <div className="p-4 border-t border-slate-100">
          <button
            onClick={handleLogout}
            type="button"
            className="flex items-center justify-center gap-2 w-full py-3 bg-[#CC1E24] hover:bg-[#A3161A] text-white rounded-xl font-bold transition-all shadow-md shadow-red-200"
          >
            <ArrowRightOnRectangleIcon className="w-5 h-5" /> ออกจากระบบ
          </button>
        </div>
      </aside>

      {/* ================= MAIN CONTENT ================= */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden">

        <header className="relative h-24 px-8 flex items-center justify-between bg-gradient-to-r from-[#8A151B] to-[#b71c22] shrink-0 z-50 shadow-md">
          <div className="text-white">
            <h2 className="text-2xl font-black flex items-center gap-2 tracking-tight">
              ยินดีต้อนรับ, {instructor.firstName}! 👋
            </h2>
            <p className="text-xs text-red-200 mt-1 font-medium tracking-wide">
              ปีการศึกษา {selectedYear === 'ALL' ? 'ทั้งหมด' : selectedYear} • แผงควบคุมอาจารย์ประจำวิชา
            </p>
          </div>

          <div className="flex items-center gap-6">
            <div className="hidden md:flex gap-1 bg-black/20 backdrop-blur-md p-1 rounded-xl border border-white/10 shadow-inner mr-2">
              {['ALL', '2568', '2567'].map((y) => (
                <Link key={y} href={`?uid=${uid}&tab=${currentTab}&year=${y}`} className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${selectedYear === y ? 'bg-white text-[#8A151B] shadow-sm' : 'text-red-100 hover:bg-white/10'}`}>
                  {y === 'ALL' ? 'ทั้งหมด' : y}
                </Link>
              ))}
            </div>

            {/* ✅ กระดิ่งแจ้งเตือน */}
            <div className="relative group">
              <button className="relative w-10 h-10 text-white hover:text-white transition bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center">
                <BellIcon className="w-5 h-5" />
                {notifications.length > 0 && <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-rose-400 rounded-full border-2 border-white"></span>}
              </button>

              <div className="absolute top-full right-0 mt-3 w-80 bg-white rounded-3xl shadow-2xl border border-slate-100 p-6 opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all pointer-events-none group-hover:pointer-events-auto z-50">
                <h4 className="font-black text-slate-900 mb-5 flex items-center gap-2">
                  <BellAlertIcon className="w-5 h-5 text-[#8A151B]" /> การแจ้งเตือน
                </h4>
                {notifications.length > 0 ? (
                  <div className="space-y-1 max-h-60 overflow-y-auto pr-2 scrollbar-thin">
                    {notifications.map((n: any) => (
                      <Link href={n.link} key={n.id} className="block border-b border-slate-100 pb-3 last:border-0 last:pb-0 hover:bg-slate-50 p-2 -mx-2 rounded-xl transition-colors">
                        <div className="flex items-start gap-2">
                          <div className={`w-2 h-2 mt-1.5 rounded-full shrink-0 ${n.title.includes('✅') ? 'bg-emerald-500' : 'bg-amber-500'}`}></div>
                          <div>
                            <p className="text-sm font-bold text-slate-800">{n.title}</p>
                            <p className="text-xs text-slate-500 mt-0.5 line-clamp-2">{n.details}</p>
                            <p className="text-[10px] text-slate-400 mt-1">
                              {new Date(n.createdAt).toLocaleDateString('th-TH', { day: 'numeric', month: 'short' })}
                            </p>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-6">
                    <CheckCircleIcon className="w-10 h-10 text-emerald-300 mx-auto mb-2" />
                    <p className="text-sm font-bold text-slate-500">ไม่มีการแจ้งเตือนใหม่</p>
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-center gap-3 pl-6 border-l border-white/20">
              <div className="text-right hidden sm:block text-white">
                <p className="text-sm font-bold">{formatTeacherName(instructor)}</p>
                <p className="text-[10px] text-red-200 uppercase font-bold tracking-wider">อาจารย์ประจำวิชา</p>
              </div>
              <div className="w-10 h-10 rounded-full bg-white text-[#8A151B] flex items-center justify-center font-black text-lg shadow-sm border-2 border-red-200">
                {instructor.firstName.charAt(0)}
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-6 lg:p-10 space-y-6 relative">
          <div className="absolute top-0 right-0 w-96 h-96 bg-red-50 rounded-full blur-3xl opacity-50 -z-10 pointer-events-none -translate-y-1/2 translate-x-1/3"></div>

          <div className="flex justify-between items-end mb-4 max-w-[1440px] mx-auto w-full">
            <div>
              <h2 className="text-2xl font-black text-slate-800">
                {currentTab === 'overview' ? 'ภาพรวมการจัดการโครงงาน' :
                  currentTab === 'subjects' ? 'จัดการรายวิชาของฉัน' :
                    currentTab === 'approvals' ? 'คำขอที่รอการพิจารณา' : 'ประวัติการดำเนินการ'}
              </h2>
            </div>
          </div>

          <div className="max-w-[1440px] mx-auto w-full">

            {/* --- TAB: ภาพรวมโครงงาน --- */}
            {currentTab === 'overview' && (
              <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2">

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm flex items-center gap-5">
                    <div className="h-14 w-14 bg-red-50 text-[#8A151B] rounded-2xl flex items-center justify-center">
                      <FolderOpenIcon className="h-7 w-7" />
                    </div>
                    <div>
                      <p className="text-3xl font-black text-slate-800">{filteredProjects.length}</p>
                      <p className="text-xs font-bold text-slate-400">จำนวนโครงงานทั้งหมดในรายวิชา</p>
                    </div>
                  </div>
                  <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm flex items-center gap-5">
                    <div className="h-14 w-14 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center">
                      <BellAlertIcon className="h-7 w-7" />
                    </div>
                    <div>
                      <p className="text-3xl font-black text-slate-800">{pendingTopics.length}</p>
                      <p className="text-xs font-bold text-slate-400">โครงงานรอพิจารณาอนุมัติ</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-[2rem] shadow-sm border border-slate-100 overflow-hidden">
                  <div className="p-6 border-b border-slate-100 flex justify-between items-center">
                    <h3 className="text-lg font-black text-slate-800">ตารางสถานะโครงงานทั้งหมด</h3>
                    <div className="flex gap-2">
                      <button className="flex items-center gap-2 px-4 py-2 text-sm font-bold text-slate-600 bg-slate-50 border border-slate-200 rounded-xl hover:bg-slate-100 transition-colors">
                        <FunnelIcon className="w-4 h-4" /> ตัวกรอง
                      </button>
                      <button className="flex items-center gap-2 px-4 py-2 text-sm font-bold text-slate-600 bg-slate-50 border border-slate-200 rounded-xl hover:bg-slate-100 transition-colors">
                        <ArrowDownTrayIcon className="w-4 h-4" /> ส่งออก
                      </button>
                    </div>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-slate-50/50 border-b border-slate-100">
                          <th className="py-4 px-6 text-sm font-bold text-[#8A151B] whitespace-nowrap">ชื่อโครงงาน</th>
                          <th className="py-4 px-6 text-sm font-bold text-[#8A151B] whitespace-nowrap">กลุ่มนักศึกษา</th>
                          <th className="py-4 px-6 text-sm font-bold text-[#8A151B] whitespace-nowrap">จำนวนครั้งที่เข้าพบ (ขั้นต่ำ 8)</th>
                          <th className="py-4 px-6 text-sm font-bold text-[#8A151B] whitespace-nowrap">สถานะ</th>
                          <th className="py-4 px-6 text-sm font-bold text-[#8A151B] whitespace-nowrap">ปี</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {activeProjects.length > 0 ? (
                          activeProjects.map((project: any) => {
                            const theme = getStatusTheme(project.status);
                            const meetingCount = project.meetingLogs?.length || 0;
                            const meetingPercent = Math.min((meetingCount / 12) * 100, 100);
                            const isMeetingPass = meetingCount >= 8;

                            const advisorUser = project.advisors.find((a: any) => a.role === 'ADVISOR')?.user;

                            return (
                              <tr key={project.id} className="hover:bg-slate-50/50 transition-colors group">
                                <td className="py-4 px-6">
                                  <Link href={`/projects/${project.id}?uid=${uid}&role=INSTRUCTOR`} className="flex items-center gap-4 group/link">
                                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border transition-colors ${theme.bg} group-hover/link:bg-[#8A151B] group-hover/link:text-white group-hover/link:border-[#8A151B]`}>
                                      <DocumentTextIcon className="w-5 h-5" />
                                    </div>
                                    <div className="max-w-xs">
                                      <p className="text-sm font-bold text-slate-900 truncate group-hover/link:text-[#8A151B] transition-colors">{project.titleTh}</p>
                                      <p className="text-xs text-slate-400 truncate mt-0.5">{project.projectCode || "รอออกรหัส"}</p>
                                    </div>
                                  </Link>
                                </td>
                                <td className="py-4 px-6">
                                  <p className="text-sm font-medium text-slate-700">
                                    {project.members.map((m: any) => m.user.firstName).join(", ")}
                                  </p>
                                  <p className="text-[11px] text-slate-400 mt-0.5">
                                    ({formatTeacherName(advisorUser)})
                                  </p>
                                </td>
                                <td className="py-4 px-6 min-w-[160px]">
                                  <div className="flex items-center gap-2 mb-1.5">
                                    <span className={`text-sm font-bold ${isMeetingPass ? 'text-emerald-600' : 'text-[#8A151B]'}`}>
                                      {meetingCount} / 12
                                    </span>
                                    {isMeetingPass && <CheckCircleIcon className="w-4 h-4 text-emerald-500" />}
                                  </div>
                                  <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                                    <div className={`h-full rounded-full transition-all duration-500 ${isMeetingPass ? 'bg-emerald-500' : 'bg-[#8A151B]'}`} style={{ width: `${meetingPercent}%` }}></div>
                                  </div>
                                </td>
                                <td className="py-4 px-6">
                                  <span className={`inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-full border ${theme.bg}`}>
                                    <span className={`w-1.5 h-1.5 rounded-full ${theme.dot}`}></span>{theme.label}
                                  </span>
                                </td>
                                <td className="py-4 px-6"><span className="text-sm font-medium text-slate-600">{project.academicYear || "-"}</span></td>
                              </tr>
                            );
                          })
                        ) : (
                          <tr><td colSpan={5} className="py-16 text-center"><FolderOpenIcon className="w-12 h-12 text-slate-300 mx-auto mb-3" /><p className="text-slate-400 font-medium">ไม่มีโครงงานที่กำลังดำเนินการ</p></td></tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* --- TAB: จัดการรายวิชา --- */}
            {currentTab === 'subjects' && (
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-lg font-bold text-slate-800">รายวิชาทั้งหมดในระบบ</h3>
                  <Link href={`/instructor/subjects?uid=${uid}`} className="bg-[#8A151B] hover:bg-slate-900 text-white font-bold py-2.5 px-5 rounded-xl shadow-md transition-all flex items-center gap-2 text-sm">
                    <PlusIcon className="w-5 h-5" /> สร้างรายวิชาใหม่
                  </Link>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {subjects.length > 0 ? subjects.map((sub: any) => (
                    <div key={sub.id} className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 hover:shadow-md hover:border-red-200 transition-all flex flex-col">
                      <div className="w-12 h-12 bg-red-50 text-[#8A151B] rounded-xl flex items-center justify-center mb-4 border border-red-100"><BookOpenIcon className="w-6 h-6" /></div>
                      <h4 className="font-bold text-slate-900 text-lg leading-tight">{sub.nameTh}</h4>
                      <p className="text-xs text-slate-500 font-mono mt-1 mb-6 flex-1">{sub.subjectCode}</p>
                      <div className="pt-4 border-t border-slate-100 flex justify-between items-center mt-auto">
                        <span className="text-xs font-bold text-slate-400 bg-slate-50 px-2.5 py-1 rounded-md">ปีการศึกษา {sub.academicYear || "-"}</span>
                        <Link
                          href={`/instructor/subjects/${sub.id}?uid=${uid}`}
                          className="text-xs font-bold text-blue-600 hover:text-white bg-blue-50 hover:bg-blue-600 px-4 py-2 rounded-lg transition-colors">จัดการวิชา
                        </Link>
                      </div>
                    </div>
                  )) : (
                    <div className="col-span-full py-16 text-center bg-white rounded-3xl border border-slate-100"><BookOpenIcon className="w-12 h-12 text-slate-300 mx-auto mb-3" /><p className="text-slate-400 font-medium">ยังไม่มีข้อมูลรายวิชาในระบบ</p></div>
                  )}
                </div>
              </div>
            )}

            {/* --- TAB: การอนุมัติ --- */}
            {currentTab === 'approvals' && (
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 max-w-4xl">
                <div className="space-y-4">
                  {pendingTopics.length > 0 ? (
                    pendingTopics.map((project: any) => {
                      const advisorUser = project.advisors.find((a: any) => a.role === 'ADVISOR')?.user;
                      return (
                        <div key={project.id} className="bg-white rounded-2xl p-6 border-l-4 border-l-[#8A151B] shadow-sm flex flex-col sm:flex-row justify-between gap-6 hover:shadow-md transition-shadow">
                          <div>
                            <div className="flex items-center gap-2 mb-2">
                              <span className="bg-purple-100 text-purple-700 text-[10px] font-bold px-2.5 py-1 rounded-md">ผ่านที่ปรึกษาแล้ว</span>
                              <span className="text-xs text-slate-400 font-mono">{project.projectCode || "โครงงานใหม่"}</span>
                            </div>
                            <h4 className="text-lg font-bold text-slate-900 mb-1">{project.titleTh}</h4>
                            <p className="text-sm text-slate-500 mb-3">{project.titleEn || "ขออนุมัติหัวข้อโครงงาน"}</p>
                            <div className="flex flex-col sm:flex-row gap-3">
                              <div className="inline-flex items-center gap-1.5 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100">
                                <AcademicCapIcon className="w-4 h-4 text-slate-400" />
                                <p className="text-xs font-bold text-slate-600">ที่ปรึกษา: {formatTeacherName(advisorUser)}</p>
                              </div>
                              <div className="inline-flex items-center gap-1.5 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100">
                                <UserCircleIcon className="w-4 h-4 text-slate-400" />
                                <p className="text-xs font-bold text-slate-600">นักศึกษา: {project.members.map((m: any) => `${m.user?.firstName || ''}`).join(', ')}</p>
                              </div>
                            </div>
                          </div>
                          <div className="shrink-0 flex items-center gap-3">
                            <Link href={`/projects/${project.id}?uid=${uid}&role=INSTRUCTOR`} className="w-full sm:w-auto bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-sm px-6 py-3 rounded-xl shadow-sm transition-all flex items-center justify-center gap-2">
                              <ClipboardDocumentCheckIcon className="w-5 h-5" /> ตรวจสอบ
                            </Link>
                            <form action={approveByInstructor}>
                              <input type="hidden" name="projectId" value={project.id} />
                              <input type="hidden" name="instructorId" value={uid} />
                              <button type="submit" className="w-full sm:w-auto bg-[#8A151B] hover:bg-slate-900 text-white font-black text-sm px-6 py-3 rounded-xl shadow-md transition-all flex items-center justify-center gap-2">
                                <CheckCircleIcon className="w-5 h-5" /> อนุมัติหัวข้อโครงงาน
                              </button>
                            </form>
                          </div>
                        </div>
                      )
                    })
                  ) : (
                    <div className="bg-white p-12 text-center rounded-3xl border border-slate-100">
                      <CheckCircleIcon className="w-16 h-16 text-emerald-400 mx-auto mb-4" />
                      <h4 className="text-lg font-bold text-slate-700">ไม่มีคำขอที่รอดำเนินการ</h4>
                      <p className="text-sm text-slate-400">คุณได้พิจารณาอนุมัติคำขอครบทั้งหมดแล้ว</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* --- TAB: ประวัติ --- */}
            {currentTab === 'history' && (
              <div className="max-w-4xl animate-in fade-in slide-in-from-bottom-4">
                <h3 className="text-xl font-black text-slate-800 mb-6">ประวัติการดำเนินการล่าสุด</h3>
                <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm relative space-y-8 before:absolute before:inset-0 before:ml-12 before:h-full before:w-0.5 before:bg-slate-100">
                  {actionHistory.length > 0 ? actionHistory.map((log: any) => (
                    <div key={log.id} className="relative pl-16 flex flex-col gap-1">
                      <div className={`absolute left-10 top-0 w-4 h-4 rounded-full border-4 border-white z-10 shadow-sm ${log.action.includes('APPROVED') ? 'bg-emerald-500' : 'bg-rose-500'}`}></div>
                      <div className="flex items-center justify-between"><h4 className="font-bold text-sm text-slate-800">{log.title}</h4><span className="text-[10px] font-bold text-slate-400 bg-slate-50 px-2 py-1 rounded-md">{new Date(log.date).toLocaleString('th-TH')}</span></div>
                      <p className="text-xs text-slate-600 bg-slate-50 border border-slate-100 p-3 rounded-xl mt-2 leading-relaxed">{log.details}</p>
                    </div>
                  )) : (
                    <div className="pl-16 text-center py-8"><p className="text-sm text-slate-400">ยังไม่มีประวัติการทำรายการ</p></div>
                  )}
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}