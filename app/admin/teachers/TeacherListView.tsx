'use client'

import { useState } from "react";
import { logoutAction } from "@/app/login/actions";
import Link from "next/link";
import Image from "next/image";
import { 
  Squares2X2Icon, BookOpenIcon, ClipboardDocumentListIcon, DocumentIcon, 
  UsersIcon, Cog8ToothIcon, QuestionMarkCircleIcon, ArrowRightOnRectangleIcon,
  AcademicCapIcon, EnvelopeIcon
} from "@heroicons/react/24/outline";

export default function TeacherListView({ 
  uid, 
  admin, 
  departmentsList,
  totalTeachers
}: any) {

  // ✅ สร้าง State สำหรับเก็บค่าสาขาวิชาที่เลือกใน Dropdown
  const [selectedDept, setSelectedDept] = useState<string>("ทั้งหมด");

  // ✅ ดึงชื่อสาขาทั้งหมดออกมาเพื่อสร้างตัวเลือกใน Dropdown
  const deptOptions = ["ทั้งหมด", ...departmentsList.map((d: any) => d.name)];

  // ✅ กรองข้อมูลสาขาที่จะแสดงผลตามตัวเลือกใน Dropdown
  const filteredDepartments = selectedDept === "ทั้งหมด" 
    ? departmentsList 
    : departmentsList.filter((d: any) => d.name === selectedDept);

  const handleLogout = async () => {
    if (confirm("คุณต้องการออกจากระบบใช่หรือไม่?")) {
      try {
        await logoutAction();
        window.location.href = "/login";
      } catch (error) {
        window.location.href = "/login";
      }
    }
  };

  const formatName = (user: any) => {
    if (!user) return "ไม่ระบุ";
    let prefix = "";
    if (user.academicRank || user.phdTitle) {
      prefix = `${user.academicRank || ""}${user.phdTitle || ""}`;
    } else if (user.titlePrefix) {
      prefix = user.titlePrefix;
    }
    return `${prefix} ${user.firstName} ${user.lastName}`.trim();
  };

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
          <Link href={`/admin?uid=${uid}`} className="flex items-center gap-3 px-4 py-3.5 text-slate-500 hover:text-[#8A151B] hover:bg-red-50/50 rounded-xl font-medium transition-all">
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
          <Link href={`/admin/users?uid=${uid}`} className="flex items-center gap-3 px-4 py-3.5 text-slate-500 hover:text-[#8A151B] hover:bg-red-50/50 rounded-xl font-medium transition-all">
            <UsersIcon className="w-5 h-5" /> จัดการผู้ใช้งาน
          </Link>
          
          <Link href={`/admin/teachers?uid=${uid}`} className="flex items-center gap-3 px-4 py-3.5 bg-red-50 text-[#8A151B] rounded-xl font-bold transition-all relative">
            <div className="absolute left-0 top-2 bottom-2 w-1 bg-[#8A151B] rounded-r-full"></div>
            <UsersIcon className="w-5 h-5" /> รายชื่ออาจารย์
          </Link>
        </nav>

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
        <main className="flex-1 overflow-y-auto p-6 lg:p-10 space-y-10">
          
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-slate-100 pb-6">
            <div>
              <h2 className="text-3xl font-black text-[#8A151B] tracking-tight flex items-center gap-3">
                <AcademicCapIcon className="w-8 h-8" /> ทำเนียบรายชื่ออาจารย์
              </h2>
              <p className="text-slate-500 mt-2 text-sm">ข้อมูลคณาจารย์ทั้งหมดในระบบ</p>
            </div>
            
            <div className="flex flex-col md:flex-row items-end md:items-center gap-3">
              <div className="bg-white border border-slate-200 px-5 py-2.5 rounded-2xl shadow-sm text-sm font-bold text-slate-600">
                รวมทั้งหมด: <span className="text-[#8A151B] text-lg ml-1">{totalTeachers}</span> ท่าน
              </div>
              
              {/* ✅ Dropdown เลือกสาขา */}
              <select 
                value={selectedDept}
                onChange={(e) => setSelectedDept(e.target.value)}
                className="bg-white border border-slate-200 text-slate-700 text-sm font-bold rounded-2xl px-5 py-2.5 outline-none focus:ring-2 focus:ring-red-100 focus:border-[#8A151B] transition-all shadow-sm cursor-pointer min-w-[200px]"
              >
                {deptOptions.map((deptName, idx) => (
                  <option key={idx} value={deptName}>{deptName}</option>
                ))}
              </select>
            </div>
          </div>

          {/* วนลูปแสดงข้อมูลตามแผนกที่ถูกกรองแล้ว */}
          {filteredDepartments.length > 0 ? (
            <div className="space-y-12">
              {filteredDepartments.map((dept: any, index: number) => (
                <div key={index} className="animate-in fade-in slide-in-from-bottom-4">
                  
                  {/* หัวข้อสาขาวิชา */}
                  <div className="flex items-center gap-3 mb-6">
                    <div className="h-px flex-1 bg-slate-200"></div>
                    <h3 className="text-xl font-black text-slate-800 bg-white border border-slate-200 px-6 py-2 rounded-full shadow-sm flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-[#8A151B]"></span>
                      {dept.name}
                      <span className="text-sm font-bold text-slate-400 ml-2">({dept.teachers.length} ท่าน)</span>
                    </h3>
                    <div className="h-px flex-1 bg-slate-200"></div>
                  </div>

                  {/* List View (แถวแนวนอน) */}
                  <div className="flex flex-col gap-4 max-w-4xl mx-auto">
                    {dept.teachers.map((teacher: any) => (
                      <div 
                        key={teacher.id} 
                        className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 hover:border-red-200 hover:shadow-md transition-all flex flex-col md:flex-row md:items-center gap-4 md:gap-6 group"
                      >
                        
                        {/* 1. ไอคอน และ ชื่ออาจารย์ (ฝั่งซ้าย) */}
                        <div className="flex items-center gap-4 md:w-1/2 shrink-0">
                          <div className="w-12 h-12 bg-red-50 text-[#8A151B] rounded-xl flex items-center justify-center text-lg font-black shrink-0 border border-red-100 group-hover:bg-[#8A151B] group-hover:text-white transition-colors">
                            {teacher.firstName.charAt(0)}
                          </div>
                          <div className="min-w-0">
                            {/* ไม่มี Role และ Username แล้ว */}
                            <h4 className="font-bold text-slate-900 text-base leading-tight truncate group-hover:text-[#8A151B] transition-colors">
                              {formatName(teacher)}
                            </h4>
                          </div>
                        </div>

                        {/* 2. อีเมล (ฝั่งขวา) */}
                        <div className="flex items-center gap-3 text-sm text-slate-600 md:w-1/2 md:justify-end pt-3 md:pt-0 border-t border-slate-50 md:border-none">
                          <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center shrink-0">
                            <EnvelopeIcon className="w-4 h-4 text-slate-400" />
                          </div>
                          <span className="truncate">{teacher.email || "ไม่ได้ระบุอีเมล"}</span>
                        </div>

                      </div>
                    ))}
                  </div>

                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-3xl p-16 text-center border border-slate-100 shadow-sm max-w-4xl mx-auto">
              <UsersIcon className="w-16 h-16 text-slate-200 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-slate-600 mb-2">ไม่พบข้อมูลอาจารย์ในสาขานี้</h3>
              <p className="text-slate-400">ลองเลือกสาขาอื่นจากเมนูด้านบน</p>
            </div>
          )}
          
        </main>
      </div>
    </div>
  );
}