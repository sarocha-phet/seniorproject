'use client'

import Image from "next/image";
import Link from "next/link";
import { logoutAction } from "@/app/login/actions";
import { reviewProjectTopic, reviewDocument } from "./actions";

import {
  HomeIcon,
  ClipboardDocumentCheckIcon,
  ArrowRightOnRectangleIcon,
  CheckCircleIcon,
  ChartPieIcon,
  BuildingLibraryIcon,
  DocumentTextIcon,
  BellIcon,
  BellAlertIcon,
  UserCircleIcon,
  AcademicCapIcon,
  FolderOpenIcon,
  ArrowDownTrayIcon,
  FunnelIcon
} from "@heroicons/react/24/outline";

const getStatusTheme = (status: string) => {
  switch (status) {
    case 'APPROVED':
    case 'IN_PROGRESS':
      return { label: "อนุมัติแล้ว (กำลังดำเนินงาน)", bg: "bg-emerald-50 text-emerald-600 border-emerald-200", dot: "bg-emerald-500" };
    case 'PENDING_APPROVAL':
    case 'PENDING_HOD_APPROVAL':
      return { label: "รอประธานหลักสูตรอนุมัติ", bg: "bg-amber-50 text-amber-600 border-amber-200", dot: "bg-amber-500" };
    case 'REJECTED':
      return { label: "ไม่ผ่าน/ต้องแก้ไข", bg: "bg-rose-50 text-rose-600 border-rose-200", dot: "bg-rose-500" };
    default:
      return { label: status, bg: "bg-slate-50 text-slate-600 border-slate-200", dot: "bg-slate-400" };
  }
};

export default function HeadDashboardView({
  uid,
  currentTab,
  selectedYear,
  headUser,
  filteredProjects,
  activeProjects,
  pendingFinalApprovals,
  pendingExamRequests,
  stats
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

  const { approvedCount, approvedPercent, chapter3Count, chapter3Percent, chapter5Count, chapter5Percent } = stats;
  const totalPending = (pendingFinalApprovals?.length || 0) + (pendingExamRequests?.length || 0);

  return (
    <div className="flex h-screen bg-[#F8FAFC] font-sans text-slate-800 overflow-hidden">

      {/* ================= SIDEBAR ================= */}
      <aside className="w-64 bg-[#FFFDFC] border-r border-red-50 flex-col z-20 shrink-0 shadow-[2px_0_15px_rgba(138,21,27,0.03)] hidden lg:flex">
        <div className="h-24 flex items-center px-6 border-b border-red-50 gap-3">
          <div className="w-11 h-11 bg-white rounded-full flex items-center justify-center shadow-sm overflow-hidden p-0.5 border border-red-100 shrink-0">
            <Image src="/images/en_ksu.png" alt="KSU Logo" width={44} height={44} className="object-contain" priority />
          </div>
          <div>
            <h1 className="font-bold text-[#8A151B] text-sm leading-tight">ระบบจัดการอาจารย์</h1>
            <p className="text-[10px] text-slate-700">ประธานหลักสูตร</p>
          </div>
        </div>

        <nav className="flex-1 px-4 py-8 space-y-2 overflow-y-auto">
          <p className="text-xs font-bold text-slate-400 px-4 mb-4 uppercase tracking-wider">เมนูหลัก (สาขาวิชา)</p>

          <Link href={`?uid=${uid}&tab=overview&year=${selectedYear}`} className={`flex items-center gap-3 px-4 py-3 rounded-2xl font-bold transition-all ${currentTab === 'overview' ? 'bg-red-50 text-[#8A151B] shadow-sm' : 'text-slate-500 hover:text-[#8A151B] hover:bg-red-50/50'}`}>
            <BuildingLibraryIcon className="w-5 h-5" /> ภาพรวมสาขาวิชา
          </Link>

          <Link href={`?uid=${uid}&tab=approvals&year=${selectedYear}`} className={`flex items-center justify-between px-4 py-3 rounded-2xl font-bold transition-all ${currentTab === 'approvals' ? 'bg-red-50 text-[#8A151B] shadow-sm' : 'text-slate-500 hover:text-[#8A151B] hover:bg-red-50/50'}`}>
            <div className="flex items-center gap-3">
              <ClipboardDocumentCheckIcon className="w-5 h-5" /> อนุมัติขั้นสุดท้าย
            </div>
            {totalPending > 0 && <span className="bg-red-100 text-red-600 py-0.5 px-2 rounded-full text-[10px]">{totalPending}</span>}
          </Link>

          <Link href={`?uid=${uid}&tab=projects&year=${selectedYear}`} className={`flex items-center gap-3 px-4 py-3 rounded-2xl font-bold transition-all ${currentTab === 'projects' ? 'bg-red-50 text-[#8A151B] shadow-sm' : 'text-slate-500 hover:text-[#8A151B] hover:bg-red-50/50'}`}>
            <FolderOpenIcon className="w-5 h-5" /> ทะเบียนโครงงาน
          </Link>

          <Link href={`?uid=${uid}&tab=reports&year=${selectedYear}`} className={`flex items-center gap-3 px-4 py-3 rounded-2xl font-bold transition-all ${currentTab === 'reports' ? 'bg-red-50 text-[#8A151B] shadow-sm' : 'text-slate-500 hover:text-[#8A151B] hover:bg-red-50/50'}`}>
            <ChartPieIcon className="w-5 h-5" /> รายงานและสถิติ
          </Link>
        </nav>

        <div className="p-4 border-t border-slate-100">
          <button
            type="button"
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 py-3 bg-[#CC1E24] hover:bg-[#A3161A] text-white rounded-xl font-bold transition-all shadow-md shadow-red-200"
          >
            <ArrowRightOnRectangleIcon className="w-5 h-5" /> ออกจากระบบ
          </button>
        </div>
      </aside>

      {/* ================= MAIN CONTENT ================= */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        <header className="bg-gradient-to-r from-[#8A151B] to-[#b71c22] h-20 px-8 flex items-center justify-between shadow-md shrink-0 z-20">
          <div className="text-white">
            <h2 className="text-lg font-bold flex items-center gap-2">
              แผงควบคุมประธานหลักสูตร 🏛️
            </h2>
            <p className="text-xs text-red-200">บริหารจัดการและอนุมัติโครงงานวิศวกรรมคอมพิวเตอร์ระดับสาขาวิชา</p>
          </div>
          <div className="flex items-center gap-5">

            <div className="relative group">
              <button className="relative p-2 text-red-200 hover:text-white transition bg-black/10 hover:bg-black/20 rounded-full">
                <BellIcon className="w-6 h-6" />
                {pendingFinalApprovals.length > 0 && <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-rose-400 rounded-full border-2 border-[#8A151B]"></span>}
              </button>

              <div className="absolute top-full right-0 mt-3 w-80 bg-white rounded-3xl shadow-2xl border border-slate-100 p-6 opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all pointer-events-none group-hover:pointer-events-auto z-50">
                <h4 className="font-black text-slate-900 mb-5 flex items-center gap-2">
                  <BellAlertIcon className="w-5 h-5 text-[#8A151B]" /> การแจ้งเตือน
                </h4>
                {pendingFinalApprovals.length > 0 ? (
                  <div className="space-y-1 max-h-60 overflow-y-auto pr-2 scrollbar-thin">
                    {pendingFinalApprovals.map((project: any) => (
                      <Link href={`?uid=${uid}&tab=approvals`} key={project.id} className="block border-b border-slate-100 pb-3 last:border-0 last:pb-0 hover:bg-slate-50 p-2 -mx-2 rounded-xl transition-colors">
                        <div className="flex items-start gap-2">
                          <div className="w-2 h-2 mt-1.5 rounded-full bg-amber-500 shrink-0"></div>
                          <div>
                            <p className="text-sm font-bold text-slate-800">รออนุมัติขั้นสุดท้าย</p>
                            <p className="text-xs text-slate-500 mt-0.5 line-clamp-2">{project.titleTh}</p>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-6">
                    <CheckCircleIcon className="w-10 h-10 text-emerald-300 mx-auto mb-2" />
                    <p className="text-sm font-bold text-slate-500">ไม่มีรายการที่ต้องพิจารณา</p>
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-center gap-3 pl-5 border-l border-red-800/50">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-bold text-white">ดร. {headUser.firstName}</p>
                <p className="text-[10px] text-red-200 uppercase">ประธานหลักสูตร</p>
              </div>
              <div className="w-10 h-10 rounded-full bg-yellow-100 text-yellow-700 flex items-center justify-center font-black text-lg shadow-sm border-2 border-red-300">
                {headUser.firstName.charAt(0)}
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-6 lg:p-10 space-y-6 relative">
          <div className="absolute top-0 right-0 w-96 h-96 bg-red-50 rounded-full blur-3xl opacity-50 -z-10 pointer-events-none -translate-y-1/2 translate-x-1/3"></div>

          <div className="flex justify-between items-end mb-4 max-w-[1440px] mx-auto w-full">
            <div>
              <h2 className="text-2xl font-black text-slate-800">
                {currentTab === 'overview' ? 'ภาพรวมสาขาวิชา' :
                  currentTab === 'approvals' ? 'รออนุมัติขั้นสุดท้าย (ประธานหลักสูตร)' :
                    currentTab === 'projects' ? 'ทะเบียนโครงงานทั้งหมด' : 'รายงานและสถิติ'}
              </h2>
            </div>
            <div className="flex items-center gap-2 bg-white p-1.5 rounded-xl border border-slate-200 shadow-sm w-fit z-10">
              <span className="text-xs font-bold text-slate-400 pl-3 pr-2">ปีการศึกษา:</span>
              {['ALL', '2568', '2567'].map((y) => (
                <Link
                  key={y}
                  href={`?uid=${uid}&tab=${currentTab}&year=${y}`}
                  className={`px-4 py-1.5 rounded-lg text-sm font-bold transition-all ${selectedYear === y ? 'bg-[#8A151B] text-white shadow-sm' : 'text-slate-500 hover:bg-slate-50'
                    }`}
                >
                  {y === 'ALL' ? 'ทั้งหมด' : y}
                </Link>
              ))}
            </div>
          </div>

          <div className="max-w-[1440px] mx-auto w-full">

            {/* --- TAB 1: ภาพรวม --- */}
            {currentTab === 'overview' && (
              <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2">

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm flex items-center gap-5">
                    <div className="h-14 w-14 bg-red-50 text-[#8A151B] rounded-2xl flex items-center justify-center border border-red-100">
                      <FolderOpenIcon className="h-7 w-7" />
                    </div>
                    <div>
                      <p className="text-3xl font-black text-slate-800">{filteredProjects.length}</p>
                      <p className="text-xs font-bold text-slate-400">โครงงานทั้งหมดในสาขา</p>
                    </div>
                  </div>
                  <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm flex items-center gap-5">
                    <div className="h-14 w-14 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center border border-amber-100">
                      <ClipboardDocumentCheckIcon className="h-7 w-7" />
                    </div>
                    <div>
                      <p className="text-3xl font-black text-slate-800">{totalPending}</p>
                      <p className="text-xs font-bold text-slate-400">รอประธานหลักสูตรอนุมัติ</p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm">
                    <h3 className="text-lg font-bold text-slate-800 mb-6">ความคืบหน้าภาพรวมของสาขาวิชา</h3>
                    <div className="space-y-4">
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="font-bold text-slate-600">เสนอหัวข้อและผ่านการอนุมัติแล้ว</span>
                          <span className="font-bold text-[#8A151B]">{approvedPercent}%</span>
                        </div>
                        <div className="w-full bg-slate-100 rounded-full h-2">
                          <div className="bg-[#8A151B] h-2 rounded-full transition-all duration-1000" style={{ width: `${approvedPercent}%` }}></div>
                        </div>
                        <p className="text-[12px] text-slate-700 mt-1 text-right">{approvedCount} จาก {filteredProjects.length} โครงงาน</p>
                      </div>
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="font-bold text-slate-600">ดำเนินการถึงบทที่ 3 (สอบเค้าโครงของโครงงาน)</span>
                          <span className="font-bold text-emerald-500">{chapter3Percent}%</span>
                        </div>
                        <div className="w-full bg-slate-100 rounded-full h-2">
                          <div className="bg-emerald-500 h-2 rounded-full transition-all duration-1000" style={{ width: `${chapter3Percent}%` }}></div>
                        </div>
                        <p className="text-[12px] text-slate-700 mt-1 text-right">{chapter3Count} จาก {filteredProjects.length} โครงงาน</p>
                      </div>
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="font-bold text-slate-600">ดำเนินการถึงบทที่ 5 (เตรียมสอบจบ)</span>
                          <span className="font-bold text-blue-500">{chapter5Percent}%</span>
                        </div>
                        <div className="w-full bg-slate-100 rounded-full h-2">
                          <div className="bg-blue-500 h-2 rounded-full transition-all duration-1000" style={{ width: `${chapter5Percent}%` }}></div>
                        </div>
                        <p className="text-[12px] text-slate-700 mt-1 text-right">{chapter5Count} จาก {filteredProjects.length} โครงงาน</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gradient-to-br from-slate-900 to-[#8A151B] p-8 rounded-[2rem] shadow-sm text-white flex flex-col justify-center items-center text-center relative overflow-hidden">
                    <ChartPieIcon className="w-32 h-32 absolute opacity-10 -right-4 -bottom-4" />
                    <h3 className="text-xl font-black mb-2">เข้าสู่ระบบรายงานแบบเต็ม</h3>
                    <p className="text-sm text-red-200 mb-6 max-w-sm">ดูสถิติเชิงลึก อัตราการผ่านโครงงาน และข้อมูลภาระงานอาจารย์ที่ปรึกษาในสาขาวิชาทั้งหมด</p>
                    <Link href={`?uid=${uid}&tab=reports`} className="bg-white text-[#8A151B] px-6 py-3 rounded-xl font-bold hover:bg-red-50 transition-colors shadow-lg z-10">
                      ดูรายงานสถิติ
                    </Link>
                  </div>
                </div>
              </div>
            )}

            {/* --- TAB 2: การอนุมัติขั้นสุดท้าย --- */}
            {currentTab === 'approvals' && (
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 max-w-5xl">
                <div className="bg-red-50 border border-red-100 p-4 rounded-2xl flex gap-3 mb-6">
                  <ClipboardDocumentCheckIcon className="w-6 h-6 text-[#8A151B] shrink-0" />
                  <p className="text-sm text-[#8A151B] font-medium">
                    รายการด้านล่างคือโครงงานที่ผ่านความเห็นชอบจาก <strong>อาจารย์ที่ปรึกษา</strong> และ <strong>อาจารย์ประจำวิชา</strong> มาแล้ว <br />รอการพิจารณาอนุมัติขั้นสุดท้ายจากประธานหลักสูตรตามแบบฟอร์มขออนุมัติชื่อเรื่อง
                  </p>
                </div>

                <div className="space-y-4">
                  {pendingFinalApprovals && pendingFinalApprovals.length > 0 && pendingFinalApprovals.map((project: any) => (
                    <div key={project.id} className="bg-white rounded-2xl p-6 border-l-4 border-l-[#8A151B] shadow-sm flex flex-col md:flex-row justify-between gap-6 hover:shadow-md transition-shadow">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="bg-purple-100 text-purple-700 text-[10px] font-bold px-2.5 py-1 rounded-md">ขออนุมัติชื่อเรื่อง</span>
                          <span className="text-xs text-slate-400 font-mono">{project.projectCode || "โครงงานใหม่"}</span>
                        </div>
                        <h4 className="text-lg font-bold text-slate-900 mb-1">{project.titleTh}</h4>
                        <p className="text-sm text-slate-500 mb-4">{project.titleEn || "ยังไม่มีชื่อภาษาอังกฤษ"}</p>

                        <div className="flex flex-wrap gap-3">
                          <div className="inline-flex items-center gap-1.5 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100">
                            <AcademicCapIcon className="w-4 h-4 text-emerald-600" />
                            <p className="text-[10px] font-bold text-slate-600">ที่ปรึกษา: <span className="text-emerald-600">ผ่านแล้ว</span></p>
                          </div>
                          <div className="inline-flex items-center gap-1.5 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100">
                            <UserCircleIcon className="w-4 h-4 text-emerald-600" />
                            <p className="text-[10px] font-bold text-slate-600">อ.ประจำวิชา: <span className="text-emerald-600">ผ่านแล้ว</span></p>
                          </div>
                        </div>
                      </div>
                      <div className="shrink-0 flex items-center md:items-end md:flex-col gap-3">
                        <form action={reviewProjectTopic as any} className="w-full md:w-auto">
                          <input type="hidden" name="projectId" value={project.id} />
                          <input type="hidden" name="lecturerId" value={uid} />
                          <input type="hidden" name="status" value="APPROVED" />
                          <button type="submit" className="bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-sm px-6 py-3 rounded-xl shadow-sm transition-all flex items-center justify-center gap-2 w-full md:w-auto">
                            <CheckCircleIcon className="w-5 h-5" /> อนุมัติชื่อเรื่อง
                          </button>
                        </form>

                        <Link href={`/projects/${project.id}?uid=${uid}&role=CHAIR`} className="bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold text-sm px-6 py-3 rounded-xl transition-all text-center w-full md:w-auto">
                          ดูรายละเอียด
                        </Link>
                      </div>
                    </div>
                  ))}

                  {pendingExamRequests && pendingExamRequests.length > 0 && pendingExamRequests.map((req: any) => (
                    <div key={req.id} className="bg-white rounded-2xl p-6 border-l-4 border-l-blue-500 shadow-sm flex flex-col md:flex-row justify-between gap-6 hover:shadow-md transition-shadow">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="bg-blue-100 text-blue-700 text-[10px] font-bold px-2.5 py-1 rounded-md">{req.fileType}</span>
                          <span className="text-xs text-slate-400 font-mono">{req.project?.projectCode || "รอออกรหัส"}</span>
                        </div>
                        <h4 className="text-lg font-bold text-slate-900 mb-1">{req.project?.titleTh}</h4>
                        <p className="text-sm text-slate-500 mb-4">สถานะ: ผ่านการอนุมัติจากอาจารย์ที่ปรึกษาแล้ว</p>
                      </div>
                      <div className="shrink-0 flex items-center md:items-end md:flex-col gap-3">
                        <form action={reviewDocument as any} className="w-full md:w-auto">
                          <input type="hidden" name="documentId" value={req.id} />
                          <input type="hidden" name="status" value="IN_PROGRESS" />
                          <input type="hidden" name="lecturerId" value={uid} />
                          <input type="hidden" name="projectId" value={req.projectId} />
                          <button type="submit" className="bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-sm px-6 py-3 rounded-xl shadow-sm transition-all flex items-center justify-center gap-2 w-full md:w-auto">
                            <CheckCircleIcon className="w-5 h-5" /> อนุมัติการสอบ
                          </button>
                        </form>
                      </div>
                    </div>
                  ))}

                  {(!pendingFinalApprovals || pendingFinalApprovals.length === 0) && (!pendingExamRequests || pendingExamRequests.length === 0) && (
                    <div className="bg-white p-12 text-center rounded-3xl border border-slate-100">
                      <CheckCircleIcon className="w-16 h-16 text-emerald-400 mx-auto mb-4" />
                      <h4 className="text-lg font-bold text-slate-700">ไม่มีคำขอที่รอดำเนินการ</h4>
                      <p className="text-sm text-slate-400">คุณได้พิจารณาอนุมัติคำขอครบทั้งหมดแล้ว</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* --- TAB 3: ทะเบียนโครงงานทั้งหมด (ตาราง) --- */}
            {currentTab === 'projects' && (
              <div className="bg-white rounded-[2rem] shadow-sm border border-slate-100 overflow-hidden animate-in fade-in slide-in-from-bottom-2">
                <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <h3 className="text-lg font-black text-slate-800">ทะเบียนโครงงานของสาขาวิชาทั้งหมด</h3>
                  <div className="flex gap-2 w-full sm:w-auto">
                    <button className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 text-sm font-bold text-slate-600 bg-slate-50 border border-slate-200 rounded-xl hover:bg-slate-100 transition-colors">
                      <FunnelIcon className="w-4 h-4" /> ตัวกรอง
                    </button>
                    <button className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 text-sm font-bold text-slate-600 bg-slate-50 border border-slate-200 rounded-xl hover:bg-slate-100 transition-colors">
                      <ArrowDownTrayIcon className="w-4 h-4" /> ส่งออก Excel
                    </button>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-50/50 border-b border-slate-100">
                        <th className="py-4 px-6 text-sm font-bold text-[#8A151B] whitespace-nowrap">รหัส / ชื่อโครงงาน</th>
                        <th className="py-4 px-6 text-sm font-bold text-[#8A151B] whitespace-nowrap">อาจารย์ที่ปรึกษา</th>
                        <th className="py-4 px-6 text-sm font-bold text-[#8A151B] whitespace-nowrap">กลุ่มนักศึกษา</th>
                        <th className="py-4 px-6 text-sm font-bold text-[#8A151B] whitespace-nowrap">สถานะภาพรวม</th>
                        <th className="py-4 px-6 text-sm font-bold text-[#8A151B] whitespace-nowrap text-right">รายละเอียด</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {filteredProjects.length > 0 ? (
                        filteredProjects.map((project: any) => {
                          const theme = getStatusTheme(project.status);
                          return (
                            <tr key={project.id} className="hover:bg-slate-50/30 transition-colors">
                              <td className="py-4 px-6">
                                <div className="max-w-xs">
                                  <p className="text-xs font-mono text-slate-400 mb-0.5">{project.projectCode || "รอออกรหัส"}</p>
                                  <p className="text-sm font-bold text-slate-900 line-clamp-2">{project.titleTh}</p>
                                </div>
                              </td>
                              <td className="py-4 px-6">
                                <p className="text-sm font-medium text-slate-700">
                                  อ. {project.advisors.find((a: any) => a.role === 'ADVISOR')?.user.firstName || "ไม่ระบุ"}
                                </p>
                              </td>
                              <td className="py-4 px-6">
                                <div className="flex flex-col gap-1">
                                  {project.members.map((m: any) => (
                                    <span key={m.id} className="text-xs text-slate-600">{m.user.firstName} {m.user.lastName}</span>
                                  ))}
                                </div>
                              </td>
                              <td className="py-4 px-6">
                                <span className={`inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-full border ${theme.bg}`}>
                                  {theme.label}
                                </span>
                              </td>
                              <td className="py-4 px-6 text-right">
                                <Link href={`/projects/${project.id}?uid=${uid}&role=CHAIR`} className="text-xs font-bold text-[#8A151B] hover:underline">
                                  ดูข้อมูล
                                </Link>
                              </td>
                            </tr>
                          );
                        })
                      ) : (
                        <tr>
                          <td colSpan={5} className="py-16 text-center text-slate-400 font-medium">ไม่มีข้อมูลโครงงานในระบบ</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* --- TAB 4: รายงาน --- */}
            {currentTab === 'reports' && (
              <div className="bg-white p-12 text-center rounded-3xl border border-slate-100">
                <ChartPieIcon className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                <h4 className="text-lg font-bold text-slate-700">ระบบรายงานเชิงลึกกำลังอยู่ระหว่างการพัฒนา</h4>
                <p className="text-sm text-slate-400 mt-2">ส่วนนี้จะแสดงกราฟสถิติภาระงานของอาจารย์ และสรุปจำนวนโครงงานที่ผ่าน/ไม่ผ่าน ในอนาคต</p>
              </div>
            )}
          </div>

        </main>
      </div>
    </div>
  );
}