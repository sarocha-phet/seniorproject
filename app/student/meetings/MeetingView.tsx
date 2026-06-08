'use client'

import Link from "next/link";
import { createMeetingLog } from "./actions";
import Image from "next/image"; 
import { logoutAction } from "@/app/login/actions";
import { 
  HomeIcon, 
  CalendarDaysIcon, 
  DocumentArrowUpIcon, 
  ArrowRightOnRectangleIcon,
  ChatBubbleBottomCenterTextIcon,
  ClockIcon,
  PlusIcon,
  PencilSquareIcon,
  CheckCircleIcon,
  DocumentCheckIcon,
  ExclamationTriangleIcon,
  ClipboardDocumentListIcon,
  DocumentMagnifyingGlassIcon
} from "@heroicons/react/24/outline";

export default function MeetingView({
  uid,
  user,
  activeProject,
  totalMeetings,
  targetMeetings,
  progress,
  remaining
}: any) {

  const handleLogout = async () => {
    if (window.confirm("คุณต้องการออกจากระบบใช่หรือไม่?")) {
      try {
        await logoutAction();
        window.location.href = '/login'; 
      } catch (error) {
        console.error("Logout failed", error);
        window.location.href = '/login';
      }
    }
  };

  return (
    <div className="flex h-screen bg-[#F8FAFC] font-sans text-slate-800 overflow-hidden">
      
      {/* ==========================================
          SIDEBAR
      ========================================== */}
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
            <HomeIcon className="w-5 h-5" /> แผงควบคุม (Dashboard)
          </Link>
          
          <Link href={`/projects/create?uid=${uid}`} className="flex items-center gap-3 px-4 py-3 text-slate-500 hover:text-[#8A151B] hover:bg-red-50/50 rounded-2xl font-bold transition-all">
            <ClipboardDocumentListIcon className="w-5 h-5" /> เสนอหัวข้อ (Proposal)
          </Link>
          
          <Link href={`/student/meetings?uid=${uid}`} className="flex items-center gap-3 px-4 py-3 bg-red-50 text-[#8A151B] rounded-2xl font-bold transition-all relative">
             <div className="absolute left-0 top-2 bottom-2 w-1 bg-[#8A151B] rounded-r-full"></div>
            <CalendarDaysIcon className="w-5 h-5" /> บันทึกเข้าพบ (Meetings)
          </Link>
          
          <Link href={`/student/documents?uid=${uid}`} className="flex items-center gap-3 px-4 py-3 text-slate-500 hover:text-[#8A151B] hover:bg-red-50/50 rounded-2xl font-bold transition-all">
            <DocumentArrowUpIcon className="w-5 h-5" /> ส่งเอกสาร (Documents)
          </Link>
          
           <Link href={`/student/proposal-exam-request?uid=${uid}`} className="flex items-center gap-3 px-4 py-3 text-slate-500 hover:text-[#8A151B] hover:bg-red-50/50 rounded-2xl font-bold transition-all">
            <DocumentMagnifyingGlassIcon className="w-5 h-5" /> ขอสอบเค้าโครง (Proposal Exam)
          </Link>

          <Link href={`/student/exam-request?uid=${uid}`} className="flex items-center gap-3 px-4 py-3 text-slate-500 hover:text-[#8A151B] hover:bg-red-50/50 rounded-2xl font-bold transition-all">
            <DocumentCheckIcon className="w-5 h-5" /> ขอสอบโครงงาน (Exam)
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

      {/* ==========================================
          MAIN CONTENT AREA
      ========================================== */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        
        {/* --- HEADER --- */}
        <header className="bg-gradient-to-r from-[#8A151B] to-[#b71c22] h-20 px-8 flex items-center justify-between shadow-md shrink-0 z-10">
          <div className="text-white">
            <h2 className="text-lg font-bold flex items-center gap-2">
              บันทึกการเข้าพบที่ปรึกษา 📝
            </h2>
            <p className="text-xs text-red-200">รหัสโครงงาน: {activeProject?.projectCode || "ไม่พบข้อมูล"}</p>
          </div>

          <div className="flex items-center gap-5">
            <div className="flex items-center gap-3 pl-5 border-l border-red-800/50">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-bold text-white">{user.firstName} {user.lastName}</p>
                <p className="text-[10px] text-red-200 uppercase">{user.username}</p>
              </div>
              <div className="w-10 h-10 rounded-full bg-white text-[#8A151B] flex items-center justify-center font-black text-lg shadow-sm border-2 border-red-300">
                {user.firstName.charAt(0)}
              </div>
            </div>
          </div>
        </header>

        {/* --- SCROLLABLE CONTENT --- */}
        <main className="flex-1 overflow-y-auto p-6 lg:p-10 space-y-8 relative">
          
          <div className="absolute top-0 right-0 w-96 h-96 bg-red-50 rounded-full blur-3xl opacity-50 -z-10 pointer-events-none -translate-y-1/2 translate-x-1/3"></div>

          {!activeProject ? (
            <div className="bg-white rounded-[2rem] p-12 shadow-sm border border-slate-100 text-center max-w-2xl mx-auto mt-10">
              <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
                <ExclamationTriangleIcon className="w-12 h-12 text-slate-400" />
              </div>
              <h2 className="text-2xl font-black text-slate-800 mb-2">คุณยังไม่มีโครงงาน</h2>
              <p className="text-slate-500 mb-8 leading-relaxed">กรุณาเสนอหัวข้อโครงงานก่อน จึงจะสามารถบันทึกการเข้าพบได้</p>
              <Link href={`/projects/create?uid=${uid}`} className="inline-flex items-center gap-2 px-8 py-4 bg-[#8A151B] text-white font-black rounded-2xl hover:bg-slate-900 transition-all shadow-xl shadow-red-200">
                <PlusIcon className="w-6 h-6" /> เสนอหัวข้อโครงงาน
              </Link>
            </div>
          ) : (
            <div className="max-w-6xl mx-auto space-y-8">
              
              {/* ================= แถวบน: สถิติ & ฟอร์มเพิ่มบันทึกใหม่ ================= */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                
                {/* Progress Card */}
                <div className="lg:col-span-1 bg-white rounded-[2.5rem] p-8 shadow-sm border border-slate-100 flex flex-col items-center text-center relative overflow-hidden h-full">
                   <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider w-full text-left mb-6">ความคืบหน้า (สิทธิ์สอบ)</h3>
                   
                   <div className="relative w-48 h-48 flex items-center justify-center mb-6 mt-2">
                     <svg className="transform -rotate-90 w-full h-full" viewBox="0 0 120 120">
                       <circle cx="60" cy="60" r="50" stroke="#F1F5F9" strokeWidth="10" fill="transparent" />
                       <circle cx="60" cy="60" r="50" stroke={progress >= 100 ? "#10B981" : "#8A151B"} strokeWidth="10" fill="transparent"
                         strokeDasharray={2 * Math.PI * 50}
                         strokeDashoffset={2 * Math.PI * 50 - (progress / 100) * 2 * Math.PI * 50}
                         strokeLinecap="round" className="transition-all duration-1000" />
                     </svg>
                     <div className="absolute flex flex-col items-center">
                       <span className="text-5xl font-black text-slate-800 leading-none">{totalMeetings}</span>
                       <span className="text-sm text-slate-400 font-bold mt-1">/ {targetMeetings} ครั้ง</span>
                     </div>
                   </div>

                   {remaining > 0 ? (
                     <p className="text-xs font-bold text-[#8A151B] bg-red-50 px-5 py-4 rounded-2xl w-full border border-red-100 mt-auto text-center">
                       ขาดอีก <span className="text-red-700 text-sm">{remaining}</span> ครั้ง เพื่อรับสิทธิ์สอบ
                     </p>
                   ) : (
                     <p className="text-xs font-bold text-emerald-700 bg-emerald-50 px-5 py-4 rounded-2xl w-full border border-emerald-100 mt-auto text-center">
                       🎉 ครบตามกำหนดสิทธิ์สอบแล้ว
                     </p>
                   )}
                </div>

                {/* Form Card */}
                <div className="lg:col-span-2 bg-white rounded-[2.5rem] p-8 lg:p-10 shadow-sm border border-slate-100 h-full">
                  <div className="flex items-center gap-3 mb-8">
                    <div className="w-12 h-12 bg-red-50 text-[#8A151B] rounded-2xl flex items-center justify-center border border-red-100">
                      <PencilSquareIcon className="w-6 h-6"/>
                    </div>
                    <h3 className="font-black text-2xl text-slate-800 tracking-tight">เพิ่มบันทึกใหม่</h3>
                  </div>
                  
                  <form action={createMeetingLog} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <input type="hidden" name="projectId" value={activeProject.id} />
                    
                    <div className="space-y-1.5 md:col-span-1">
                      <label className="text-xs font-bold text-slate-500 ml-1 uppercase tracking-wider">วันที่เข้าพบ <span className="text-red-500">*</span></label>
                      <input 
                        type="date" 
                        name="meetDate"
                        required
                        defaultValue={new Date().toISOString().split('T')[0]}
                        className="w-full bg-slate-50 border border-slate-200 text-slate-700 rounded-2xl px-5 py-4 outline-none focus:ring-2 focus:ring-red-100 focus:border-[#8A151B] transition-all text-sm font-medium"
                      />
                    </div>

                    <div className="space-y-1.5 md:col-span-1">
                      <label className="text-xs font-bold text-slate-500 ml-1 uppercase tracking-wider">หัวข้อที่ปรึกษา <span className="text-red-500">*</span></label>
                      <input 
                        type="text" 
                        name="topic"
                        required
                        placeholder="เช่น ปรึกษาบทที่ 3, ตรวจสอบระบบ"
                        className="w-full bg-slate-50 border border-slate-200 text-slate-700 rounded-2xl px-5 py-4 outline-none focus:ring-2 focus:ring-red-100 focus:border-[#8A151B] transition-all text-sm font-medium"
                      />
                    </div>

                    <div className="space-y-1.5 md:col-span-2">
                      <label className="text-xs font-bold text-slate-500 ml-1 uppercase tracking-wider">รายละเอียด / คำแนะนำ</label>
                      <textarea 
                        name="note"
                        rows={3}
                        placeholder="อาจารย์แนะนำให้ปรับปรุงส่วนไหนบ้าง..."
                        className="w-full bg-slate-50 border border-slate-200 text-slate-700 rounded-2xl px-5 py-4 outline-none focus:ring-2 focus:ring-red-100 focus:border-[#8A151B] transition-all text-sm font-medium resize-none"
                      ></textarea>
                    </div>

                    <div className="md:col-span-2 flex justify-end">
                      <button 
                        type="submit" 
                        className="bg-[#8A151B] text-white font-black py-4 px-8 rounded-2xl hover:bg-slate-900 shadow-lg shadow-red-200 transition-all active:scale-95 flex items-center justify-center gap-2"
                      >
                        <PlusIcon className="w-5 h-5" /> บันทึกการเข้าพบ
                      </button>
                    </div>
                  </form>
                </div>

              </div>

              {/* ================= แถวล่าง: ประวัติการเข้าพบ ================= */}
              <div className="w-full">
                <div className="bg-white rounded-[2.5rem] p-8 lg:p-10 shadow-sm border border-slate-100">
                  
                  <div className="flex justify-between items-center mb-8 border-b border-slate-50 pb-6">
                    <h3 className="font-black text-xl text-slate-800 flex items-center gap-3">
                      <CalendarDaysIcon className="w-7 h-7 text-[#8A151B]" /> ประวัติการเข้าพบ
                    </h3>
                    <span className="text-xs font-bold text-[#8A151B] bg-red-50 px-4 py-2 rounded-full border border-red-100">
                      เข้าพบแล้ว {totalMeetings} ครั้ง
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {activeProject.meetingLogs.length > 0 ? (
                      activeProject.meetingLogs.map((log: any) => (
                        <div key={log.id} className="flex items-start gap-4 p-5 bg-slate-50 hover:bg-white rounded-2xl transition-all border border-slate-100 hover:border-red-100 hover:shadow-sm group">
                          
                          <div className="flex flex-col items-center justify-center bg-white border border-slate-200 shadow-sm w-14 h-14 rounded-xl shrink-0 group-hover:border-[#8A151B] transition-colors">
                            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-0.5 group-hover:text-[#8A151B]">
                              {log.meetDate.toLocaleDateString('th-TH', { month: 'short' })}
                            </span>
                            <span className="text-lg font-black text-slate-800 leading-none group-hover:text-[#8A151B]">
                              {log.meetDate.getDate()}
                            </span>
                          </div>

                          <div className="flex-1 min-w-0">
                            <div className="flex justify-between items-start mb-1.5">
                              <h4 className="font-bold text-slate-900 text-sm truncate pr-2">{log.topic}</h4>
                            </div>
                            
                            <span className={`text-[9px] font-bold px-2 py-1 rounded-md flex items-center w-fit gap-1 shrink-0 border mb-2
                              ${log.status === 'APPROVED' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 
                                log.status === 'REJECTED' ? 'bg-rose-50 text-rose-700 border-rose-200' : 
                                'bg-amber-50 text-amber-700 border-amber-200'}
                            `}>
                              {log.status === 'APPROVED' && <CheckCircleIcon className="w-3 h-3" />}
                              {log.status === 'REJECTED' && <ExclamationTriangleIcon className="w-3 h-3" />}
                              {(!log.status || log.status === 'PENDING') && <ClockIcon className="w-3 h-3" />}
                              
                              {log.status === 'APPROVED' ? 'ที่ปรึกษายืนยันแล้ว' : 
                               log.status === 'REJECTED' ? 'ปฏิเสธการเข้าพบ' : 'รอการยืนยัน'}
                            </span>
                            
                            <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                              {log.note || <span className="text-slate-400 italic font-medium">ไม่มีรายละเอียดเพิ่มเติม</span>}
                            </p>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="col-span-full flex flex-col items-center justify-center py-16 text-center border-2 border-dashed border-slate-100 rounded-3xl">
                        <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                          <ChatBubbleBottomCenterTextIcon className="w-8 h-8 text-slate-300" />
                        </div>
                        <h4 className="text-slate-600 font-bold text-base mb-1">ยังไม่มีประวัติการเข้าพบ</h4>
                        <p className="text-xs text-slate-400">เมื่อคุณเพิ่มบันทึกใหม่ ประวัติจะแสดงที่นี่</p>
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