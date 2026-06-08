'use client' // 🚨 ระบุว่าเป็น Client Component เพื่อให้ใช้ onClick ได้

import { logoutAction } from "@/app/login/actions";
import Link from "next/link";
import Image from "next/image";
import { 
  Squares2X2Icon, BookOpenIcon, ClipboardDocumentListIcon, DocumentIcon, 
  UsersIcon, Cog8ToothIcon, QuestionMarkCircleIcon, ArrowRightOnRectangleIcon,
  PlusCircleIcon, CloudArrowUpIcon, UserPlusIcon, BellAlertIcon,
  DocumentTextIcon, UserGroupIcon, ClockIcon
} from "@heroicons/react/24/outline";

export default function AdminDashboardView({ 
  admin, uid, totalSubjects, activeProjects, totalDocs, latestDocs, pendingProjects, departments 
}: any) {

  // ✅ ฟังก์ชัน Logout
  const handleLogout = async () => {
    if (confirm("คุณต้องการออกจากระบบใช่หรือไม่?")) {
      try {
        await logoutAction();
        window.location.href = "/login"; // ใช้ window.location เพื่อล้างสถานะทั้งหมด
      } catch (error) {
        console.error("Logout failed:", error);
        window.location.href = "/login";
      }
    }
  };

  // ✅ ฟังก์ชันจัดรูปแบบชื่อ
  const formatName = (user: any) => {
    if (!user) return "ไม่ระบุ";
    let prefix = "";
    if (user.academicRank || user.phdTitle) {
      prefix = `${user.academicRank || ""}${user.phdTitle || ""}`;
    } else if (user.titlePrefix) {
      prefix = user.titlePrefix;
    } else {
      prefix = "คุณ";
    }
    return `${prefix} ${user.firstName} ${user.lastName}`.trim();
  };

  const timeString = new Date().toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' });

  return (
    <div className="flex h-screen bg-[#FDFBFB] font-sans text-slate-800 overflow-hidden">
      
      {/* ================= SIDEBAR ================= */}
      <aside className="w-64 bg-[#FFFDFC] border-r border-red-50 flex flex-col z-20 shrink-0 shadow-[2px_0_15px_rgba(138,21,27,0.03)]">
        <div className="h-24 flex items-center px-6 border-b border-red-50 gap-3">
          <div className="w-11 h-11 bg-white rounded-full flex items-center justify-center shadow-sm overflow-hidden p-0.5 border border-red-100 shrink-0">
            <Image src="/images/en_ksu.png" alt="KSU Logo" width={44} height={44} className="object-contain" priority />
          </div>
          <div>
            <h1 className="font-bold text-[#8A151B] text-sm leading-tight">ระบบจัดการแอดมิน</h1>
            <p className="text-[10px] text-slate-400">มหาวิทยาลัยกาฬสินธุ์</p>
          </div>
        </div>

        <nav className="flex-1 py-6 space-y-1 overflow-y-auto px-3">
          <Link href={`/admin?uid=${uid}`} className="flex items-center gap-3 px-4 py-3.5 bg-red-50 text-[#8A151B] rounded-xl font-bold transition-all relative">
            <div className="absolute left-0 top-2 bottom-2 w-1 bg-[#8A151B] rounded-r-full"></div>
            <Squares2X2Icon className="w-5 h-5" /> แผงควบคุม
          </Link>
          <Link href={`/admin/subjects?uid=${uid}`} className="flex items-center gap-3 px-4 py-3.5 text-slate-500 hover:text-[#8A151B] hover:bg-red-50/50 rounded-xl font-medium transition-all">
            <BookOpenIcon className="w-5 h-5" /> รายวิชา
          </Link>
          <Link href={`/admin/projects?uid=${uid}`} className="flex items-center gap-3 px-4 py-3.5 text-slate-500 hover:text-[#8A151B] hover:bg-red-50/50 rounded-xl font-medium transition-all">
            <ClipboardDocumentListIcon className="w-5 h-5" /> โครงงานวิจัย
          </Link>
          <Link href={`/admin/documents?uid=${uid}`} className="flex items-center gap-3 px-4 py-3.5 text-slate-500 hover:text-[#8A151B] hover:bg-red-50/50 rounded-xl font-medium transition-all">
            <DocumentIcon className="w-5 h-5" /> เอกสาร
          </Link>
          
          {/* ✅ เมนูจัดการผู้ใช้งาน (ย้ายมาจากเมนูด่วน) */}
          <Link href={`/admin/users?uid=${uid}`} className="flex items-center gap-3 px-4 py-3.5 text-slate-500 hover:text-[#8A151B] hover:bg-red-50/50 rounded-xl font-medium transition-all">
            <UserGroupIcon className="w-5 h-5" /> จัดการผู้ใช้งาน
          </Link>

          <Link href={`/admin/teachers?uid=${uid}`} className="flex items-center gap-3 px-4 py-3.5 text-slate-500 hover:text-[#8A151B] hover:bg-red-50/50 rounded-xl font-medium transition-all">
            <UsersIcon className="w-5 h-5" /> รายชื่ออาจารย์
          </Link>
        </nav>

        {/* ปุ่มออกจากระบบ */}
        <div className="p-4">
          <button 
            onClick={handleLogout}
            className="flex items-center justify-center gap-2 w-full py-3 bg-[#CC1E24] hover:bg-[#A3161A] text-white rounded-xl font-bold transition-all shadow-md shadow-red-200"
          >
            <ArrowRightOnRectangleIcon className="w-5 h-5" /> ออกจากระบบ
          </button>
        </div>
      </aside>

      {/* ================= MAIN CONTENT AREA ================= */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        <main className="flex-1 overflow-y-auto p-6 lg:p-10">
          
          <header className="relative bg-gradient-to-r from-[#4A151B] via-[#8A151B] to-[#b71c22] rounded-[2.5rem] p-8 lg:p-10 mb-10 text-white shadow-xl overflow-hidden flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="relative z-10">
              <h2 className="text-3xl lg:text-4xl font-black mb-2 tracking-tight">ภาพรวมระบบแอดมิน</h2>
              <p className="text-red-100 text-sm font-medium">ยินดีต้อนรับกลับมา, {formatName(admin)}</p>
            </div>
            <div className="relative z-10 flex items-center gap-4 bg-black/20 backdrop-blur-md border border-white/10 px-6 py-4 rounded-2xl shadow-inner">
              <ClockIcon className="w-6 h-6 text-red-100" />
              <div>
                <p className="text-[10px] text-red-200 font-bold uppercase mb-0.5">อัปเดตล่าสุด</p>
                <p className="text-2xl font-mono font-black">{timeString} น.</p>
              </div>
            </div>
          </header>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
            <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
              <p className="text-sm font-bold text-slate-500 mb-4">รายวิชาทั้งหมด</p>
              <p className="text-4xl font-black text-slate-800">{totalSubjects}</p>
            </div>
            <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
              <p className="text-sm font-bold text-slate-500 mb-4">โครงงานที่เปิดอยู่</p>
              <p className="text-4xl font-black text-slate-800">{activeProjects}</p>
            </div>
            <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
              <p className="text-sm font-bold text-slate-500 mb-4">เอกสารในระบบ</p>
              <p className="text-4xl font-black text-[#8A151B]">{totalDocs.toLocaleString()}</p>
            </div>
            <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
              <p className="text-sm font-bold text-slate-500 mb-4">สถานะระบบ</p>
              <p className="text-4xl font-black text-slate-800">98%</p>
            </div>
          </div>

          {/* ✅ ลบเมนูด่วน (Quick Actions) ออกจากตรงนี้ตามที่ต้องการ */}

          {/* เอกสารล่าสุด & การแจ้งเตือน */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <h3 className="text-lg font-bold text-[#4A151B] mb-4">เอกสารล่าสุด</h3>
              <div className="bg-white rounded-[2rem] shadow-sm border border-slate-100 overflow-hidden">
                <table className="w-full text-left">
                  <thead className="bg-slate-50/50 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                    <tr>
                      <th className="px-6 py-4">ชื่อเอกสาร</th>
                      <th className="px-6 py-4">อัปโหลดโดย</th>
                      <th className="px-6 py-4 text-center">สถานะ</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {latestDocs.map((doc: any, idx: number) => (
                      <tr key={idx} className="hover:bg-slate-50 transition-colors">
                        <td className="px-6 py-4 text-sm font-bold text-slate-700">{doc.filePath.split('/').pop()}</td>
                        <td className="px-6 py-4 text-xs text-[#8A151B] font-bold">{doc.uploader?.firstName} {doc.uploader?.lastName}</td>
                        <td className="px-6 py-4 text-center">
                          <span className={`px-3 py-1.5 rounded-full text-[10px] font-bold border ${doc.status === 'APPROVED' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-amber-50 text-amber-700 border-amber-200'}`}>
                            {doc.status === 'APPROVED' ? 'อนุมัติแล้ว' : 'รอตรวจสอบ'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="space-y-8">
              <div>
                <h3 className="text-lg font-bold text-[#4A151B] mb-4 flex items-center gap-2"><BellAlertIcon className="w-5 h-5 text-red-600" /> การแจ้งเตือน</h3>
                <div className="bg-white rounded-[2rem] p-6 shadow-sm border border-slate-100 space-y-4">
                  {pendingProjects.map((p: any) => (
                    <div key={p.id} className="flex gap-4 p-2">
                      <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center shrink-0"><DocumentIcon className="w-5 h-5" /></div>
                      <div>
                        <h4 className="text-sm font-bold text-slate-800 leading-tight">การส่งงานวิจัยใหม่</h4>
                        <p className="text-xs text-slate-500 mt-1 line-clamp-1">{p.titleTh}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-lg font-bold text-[#4A151B] mb-4">แผนกวิชา</h3>
                <div className="space-y-3">
                  {departments.map((dept: any, idx: number) => (
                    <div key={idx} className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 flex items-center gap-4 cursor-pointer hover:border-red-200 transition-all">
                      <div className="w-12 h-12 bg-red-50 text-[#8A151B] font-black text-sm rounded-xl flex items-center justify-center uppercase">{dept.name.substring(0, 2)}</div>
                      <div className="flex-1">
                        <h4 className="text-sm font-bold text-slate-800">{dept.name}</h4>
                        <p className="text-xs text-slate-400">อาจารย์ {dept.count} ท่าน</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
          
        </main>
      </div>
    </div>
  );
}