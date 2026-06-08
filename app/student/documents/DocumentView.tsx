'use client'

import Link from "next/link";
import UploadForm from "./UploadForm";
import Image from "next/image";
import { deleteDocument } from "./actions";
import { logoutAction } from "@/app/login/actions";
import {
  CalendarDaysIcon,
  DocumentArrowUpIcon,
  ArrowRightOnRectangleIcon,
  DocumentTextIcon,
  PlusIcon,
  DocumentCheckIcon,
  DocumentMagnifyingGlassIcon,
  ClipboardDocumentListIcon,
  EyeIcon,
  TrashIcon
} from "@heroicons/react/24/outline";

const formatDate = (date: Date) => {
  return new Date(date).toLocaleDateString('th-TH', {
    year: 'numeric', month: 'short', day: 'numeric',
    hour: '2-digit', minute: '2-digit'
  });
};

export default function DocumentView({
  uid,
  user,
  activeProject,
  documents
}: any) {

  const handleLogout = async () => {
    if (window.confirm("คุณต้องการออกจากระบบใช่หรือไม่?")) {
      try {
        await logoutAction();
        window.location.href = '/login';
      } catch (error) {
        window.location.href = '/login';
      }
    }
  };

  return (
    <div className="flex h-screen bg-[#F8FAFC] font-sans text-slate-800 overflow-hidden">

      {/* ================= SIDEBAR ================= */}
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

          <Link href={`/student?uid=${uid}`} className="flex items-center gap-3 px-4 py-3 text-slate-500 hover:text-[#8A151B] hover:bg-red-50/50 rounded-2xl font-bold transition-all">
            <CalendarDaysIcon className="w-5 h-5" /> แผงควบคุม (Dashboard)
          </Link>

          <Link href={`/projects/create?uid=${uid}`} className="flex items-center gap-3 px-4 py-3 text-slate-500 hover:text-[#8A151B] hover:bg-red-50/50 rounded-2xl font-bold transition-all">
            <ClipboardDocumentListIcon className="w-5 h-5" /> เสนอหัวข้อ (Proposal)
          </Link>

          <Link href={`/student/meetings?uid=${uid}`} className="flex items-center gap-3 px-4 py-3 text-slate-500 hover:text-[#8A151B] hover:bg-red-50/50 rounded-2xl font-bold transition-all">
            <CalendarDaysIcon className="w-5 h-5" /> บันทึกเข้าพบ (Meetings)
          </Link>

          <Link href={`/student/documents?uid=${uid}`} className="flex items-center gap-3 px-4 py-3 bg-red-50 text-[#8A151B] rounded-2xl font-bold transition-all relative">
            <div className="absolute left-0 top-2 bottom-2 w-1 bg-[#8A151B] rounded-r-full"></div>
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

      {/* ================= MAIN CONTENT AREA ================= */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden">

        {/* ✅ ปรับ z-50 ให้ส่วน Header */}
        <header className="relative bg-gradient-to-r from-[#8A151B] to-[#b71c22] h-20 px-8 flex items-center justify-between shadow-md shrink-0 z-50">
          <div className="text-white">
            <h2 className="text-lg font-bold flex items-center gap-2">ส่งรายงานและเอกสาร 📄</h2>
            <p className="text-xs text-red-200">รหัสโครงงาน: {activeProject?.projectCode || "ไม่พบข้อมูล"}</p>
          </div>
          <div className="flex items-center gap-5">
            <div className="flex items-center gap-3 pl-5 border-l border-red-800/50">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-bold text-white">{user.firstName} {user.lastName}</p>
                <p className="text-[10px] text-red-200 uppercase">{user.username}</p>
              </div>
              <div className="w-10 h-10 rounded-full bg-white text-[#8A151B] flex items-center justify-center font-black text-lg shadow-sm border-2 border-red-300">{user.firstName.charAt(0)}</div>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-6 lg:p-10 space-y-8 relative">
          <div className="absolute top-0 right-0 w-96 h-96 bg-red-50 rounded-full blur-3xl opacity-50 -z-10 pointer-events-none -translate-y-1/2 translate-x-1/3"></div>

          {!activeProject ? (
            <div className="bg-white rounded-[2rem] p-12 shadow-sm border border-slate-100 text-center max-w-2xl mx-auto mt-10">
              <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6"><DocumentTextIcon className="w-12 h-12 text-slate-400" /></div>
              <h2 className="text-2xl font-black text-slate-800 mb-2">ยังไม่สามารถส่งเอกสารได้</h2>
              <p className="text-slate-500 mb-8 leading-relaxed">คุณต้องเสนอหัวข้อโครงงานให้เรียบร้อยก่อน จึงจะสามารถส่งรายงานและเอกสารต่างๆ ได้</p>
              <Link href={`/projects/create?uid=${uid}`} className="inline-flex items-center gap-2 px-8 py-4 bg-[#8A151B] text-white font-black rounded-2xl hover:bg-slate-900 transition-all shadow-xl shadow-red-200"><PlusIcon className="w-6 h-6" /> ไปหน้าเสนอหัวข้อ</Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">

              {/* ฟอร์มอัปโหลด */}
              <div className="lg:col-span-1">
                <UploadForm projectId={activeProject.id} uploaderId={uid} />
              </div>

              {/* ประวัติการส่งเอกสาร */}
              <div className="lg:col-span-2">
                <div className="bg-white rounded-[2.5rem] p-8 lg:p-10 shadow-sm border border-slate-100 min-h-[600px]">
                  <div className="flex justify-between items-center mb-8 border-b border-slate-100 pb-6">
                    <h3 className="font-black text-xl text-slate-800 flex items-center gap-3"><DocumentTextIcon className="w-7 h-7 text-[#8A151B]" /> ประวัติการส่งเอกสาร</h3>
                    <span className="text-xs font-bold text-[#8A151B] bg-red-50 px-4 py-2 rounded-full border border-red-100">ส่งแล้ว {documents.length} รายการ</span>
                  </div>

                  <div className="space-y-5">
                    {documents.length > 0 ? (
                      documents.map((doc: any, index: number) => {
                        const docStatus = doc.status?.toUpperCase() || 'PENDING';
                        return (
                          <div key={index} className="group flex flex-col sm:flex-row gap-5 p-6 bg-slate-50 hover:bg-white rounded-3xl transition-all border border-slate-100 hover:border-slate-200 hover:shadow-sm items-start sm:items-center">
                            <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center shrink-0 border border-slate-200 group-hover:border-[#8A151B] transition-colors shadow-sm">
                              <DocumentTextIcon className="w-8 h-8 text-slate-400 group-hover:text-[#8A151B]" />
                            </div>
                            <div className="flex-1 w-full min-w-0">
                              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3 mb-2">
                                <h4 className="font-bold text-slate-900 text-lg leading-tight">{doc.fileType}</h4>
                                <span className={`text-[10px] font-bold px-3 py-1.5 rounded-full flex items-center w-fit gap-1.5 shrink-0 border ${docStatus === 'APPROVED' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : docStatus === 'REJECTED' ? 'bg-rose-50 text-rose-700 border-rose-200' : 'bg-amber-50 text-amber-700 border-amber-200'}`}>
                                  {docStatus === 'APPROVED' ? 'ตรวจผ่านแล้ว' : docStatus === 'REJECTED' ? 'ต้องแก้ไข' : 'รอตรวจสอบ'}
                                </span>
                              </div>

                              <div className="flex items-center justify-between gap-4">
                                <p className="text-xs text-slate-500 font-medium truncate">
                                  ไฟล์: {doc.filePath.split('/').pop()}
                                </p>

                                <a
                                  href={doc.filePath}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-[10px] font-black text-slate-600 hover:text-[#8A151B] hover:border-[#8A151B] transition-all shadow-sm shrink-0"
                                >
                                  <EyeIcon className="w-3.5 h-3.5" />
                                  ดูไฟล์
                                </a>
                                {docStatus === 'PENDING' && (
                                  <button
                                    onClick={async () => {
                                      if (window.confirm("คุณแน่ใจหรือไม่ว่าต้องการยกเลิกและลบเอกสารนี้?")) {
                                        const fd = new FormData();
                                        fd.append("documentId", doc.id);
                                        await deleteDocument(fd);
                                        window.location.reload(); // รีเฟรชหน้าเพื่อลบรายการออก
                                      }
                                    }}
                                    className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-rose-200 rounded-lg text-[10px] font-black text-rose-500 hover:bg-rose-500 hover:text-white transition-all shadow-sm shrink-0"
                                  >
                                    <TrashIcon className="w-3.5 h-3.5" />
                                    ยกเลิก
                                  </button>
                                )}
                              </div>

                              <div className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-2">
                                ส่งเมื่อ: {formatDate(doc.uploadedAt || new Date())}
                              </div>
                            </div>
                          </div>
                        );
                      })
                    ) : (
                      <div className="flex flex-col items-center justify-center py-24 text-center">
                        <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mb-6"><DocumentTextIcon className="w-12 h-12 text-slate-300" /></div>
                        <h4 className="text-slate-600 font-bold text-lg mb-2">ยังไม่มีประวัติการส่งเอกสาร</h4>
                        <p className="text-sm text-slate-400">เมื่อคุณอัปโหลดไฟล์ ประวัติและสถานะจะแสดงที่นี่โดยอัตโนมัติ</p>
                      </div>
                    )}
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