'use client'

import { useState, useRef } from "react";
import { createProject } from "../actions"; 
import PdfPrintButton from "./PdfPrintButton";
import { 
  UserGroupIcon, 
  AcademicCapIcon,
  CheckBadgeIcon
} from "@heroicons/react/24/outline";

export default function CreateProjectForm({ uid, currentUser, students, lecturers, chairPerson, subjectId }: any) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const formRef = useRef<HTMLFormElement>(null); 

  const handleFormAction = async (formData: FormData) => {
    setIsSubmitting(true);
    
    try {
      const res: any = await createProject(formData);
      console.log("Server Response:", res);
      
      if (res && res.success === true) {
        alert("✅ บันทึกและเสนอหัวข้อโครงงานสำเร็จ!");
        formRef.current?.reset(); 
      } else {
        alert(`❌ บันทึกไม่สำเร็จ: ${res?.error || "ไม่พบข้อมูลตอบกลับจากเซิร์ฟเวอร์"}`);
      }
    } catch (error: any) {
      alert(`❌ เกิดข้อผิดพลาดของระบบ: ${error.message || "การเชื่อมต่อขัดข้อง"}`);
      console.error("Submit Error:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form ref={formRef} action={handleFormAction} className="p-8 lg:p-12 space-y-10">
      <input type="hidden" name="creatorId" value={uid || ''} />
      <input type="hidden" name="subjectId" value={subjectId || ''} />

      {/* ส่วนที่ 1: ข้อมูลโครงงาน */}
      <section className="space-y-6">
        <div className="flex items-center gap-2 border-b border-slate-100 pb-4">
           <div className="w-2 h-8 bg-[#8A151B] rounded-full"></div>
           <h2 className="text-xl font-black text-slate-800">1. ข้อมูลโครงงาน</h2>
        </div>
        
        <div className="grid gap-6">
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">
              ชื่อโครงงาน (ภาษาไทย) <span className="text-red-500">*</span>
            </label>
            <input 
              type="text" name="titleTh" required
              placeholder="เช่น ระบบบริหารจัดการโครงงานวิจัย..."
              className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 focus:ring-2 focus:ring-red-100 focus:border-[#8A151B] outline-none transition-all"
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">ชื่อโครงงาน (ภาษาอังกฤษ)</label>
            <input 
              type="text" name="titleEn" 
              placeholder="e.g. Senior Project Management System"
              className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 focus:ring-2 focus:ring-red-100 focus:border-[#8A151B] outline-none transition-all"
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">รายละเอียดสังเขป / บทคัดย่อ</label>
            <textarea 
              name="abstract" rows={4}
              placeholder="อธิบายรายละเอียดของโครงงานโดยย่อ..."
              className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 focus:ring-2 focus:ring-red-100 focus:border-[#8A151B] outline-none transition-all resize-none"
            ></textarea>
          </div>
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">
              วัตถุประสงค์ของโครงงาน <span className="text-red-500">*</span>
            </label>
            <textarea 
              name="objectives" rows={4} required
              placeholder="ระบุวัตถุประสงค์ของโครงงาน..."
              className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 focus:ring-2 focus:ring-red-100 focus:border-[#8A151B] outline-none transition-all resize-none"
            ></textarea>
          </div>
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">ขอบเขตของโครงงาน (Project Scope)</label>
            <textarea 
              name="scope" rows={4}
              placeholder="ระบุขอบเขตงาน Hardware, Software ที่จะทำ..."
              className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 focus:ring-2 focus:ring-red-100 focus:border-[#8A151B] outline-none transition-all resize-none"
            ></textarea>
          </div>
        </div>
      </section>

      {/* ส่วนที่ 2: สมาชิกและที่ปรึกษา */}
      <section className="space-y-6">
        <div className="flex items-center gap-2 border-b border-slate-100 pb-4">
           <div className="w-2 h-8 bg-slate-800 rounded-full"></div>
           <h2 className="text-xl font-black text-slate-800">2. คณะผู้จัดทำและที่ปรึกษา</h2>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          <div className="bg-slate-50 p-8 rounded-[2rem] border border-slate-100 space-y-6">
            <h3 className="flex items-center gap-2 font-bold text-slate-800">
              <UserGroupIcon className="w-6 h-6 text-[#8A151B]" /> สมาชิกในกลุ่ม
            </h3>
            
            <div className="space-y-5">
              <div>
                <label className="text-xs font-bold text-slate-400 mb-2 block uppercase tracking-wider">สมาชิกคนที่ 1 (หัวหน้ากลุ่ม)</label>
                <div className="w-full bg-white border border-red-200 rounded-xl px-4 py-3 flex items-center justify-between shadow-sm">
                  <span className="text-sm font-bold text-red-700">
                    {currentUser ? `${currentUser.firstName} ${currentUser.lastName}` : "ไม่พบข้อมูลผู้ใช้"}
                  </span>
                  <CheckBadgeIcon className="w-5 h-5 text-red-600" />
                </div>
                <input type="hidden" name="studentId1" value={uid} />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-400 mb-2 block uppercase tracking-wider">สมาชิกคนที่ 2 (ถ้ามี)</label>
                <select name="studentId2" className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-red-100 outline-none">
                  <option value="">-- ไม่ระบุ --</option>
                  {students.map((s: any) => (
                    <option key={s.id} value={s.id} disabled={s.projects.length > 0} className={s.projects.length > 0 ? "text-slate-300" : ""}>
                      {s.firstName} {s.lastName} {s.projects.length > 0 ? "(มีกลุ่มแล้ว)" : ""}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-400 mb-2 block uppercase tracking-wider">สมาชิกคนที่ 3 (ถ้ามี)</label>
                <select name="studentId3" className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-red-100 outline-none">
                  <option value="">-- ไม่ระบุ --</option>
                  {students.map((s: any) => (
                    <option key={s.id} value={s.id} disabled={s.projects.length > 0} className={s.projects.length > 0 ? "text-slate-300" : ""}>
                      {s.firstName} {s.lastName} {s.projects.length > 0 ? "(มีกลุ่มแล้ว)" : ""}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-red-50/50 p-8 rounded-[2rem] border border-red-100 space-y-6">
              <h3 className="flex items-center gap-2 font-bold text-[#8A151B]">
                <AcademicCapIcon className="w-6 h-6" /> อาจารย์ที่ปรึกษา
              </h3>
              <div>
                <label className="text-xs font-bold text-red-400 mb-2 block uppercase tracking-wider">
                  อาจารย์ที่ปรึกษาหลัก <span className="text-red-500">*</span>
                </label>
                <select name="advisorId" required className="w-full bg-white border border-red-100 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-red-100 outline-none">
                  <option value="">-- เลือกอาจารย์ --</option>
                  {lecturers.map((t: any) => (
                    <option key={t.id} value={t.id}>อ. {t.firstName} {t.lastName}</option>
                  ))}
                </select>
              </div>
              <div className="p-4 bg-white/50 rounded-xl border border-red-100/50">
                <p className="text-[10px] text-red-400 leading-relaxed font-medium">
                  * คุณสามารถเพิ่ม "อาจารย์ที่ปรึกษาร่วม" ได้หลังจากที่หัวข้อโครงงานนี้ได้รับการอนุมัติจากอาจารย์ที่ปรึกษาหลักและผ่านเข้าสู่ระบบแล้ว
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="pt-10">
        <button 
          type="submit"
          disabled={isSubmitting}
          className={`w-full font-black py-5 rounded-[1.5rem] transition-all flex justify-center items-center gap-3 text-lg shadow-xl shadow-red-200 
            ${isSubmitting ? 'bg-slate-400 text-slate-100 cursor-not-allowed' : 'bg-[#8A151B] text-white hover:bg-slate-900 hover:shadow-slate-200'}`}
        >
          <span>{isSubmitting ? 'กำลังบันทึกข้อมูล...' : 'บันทึกและเสนอหัวข้อโครงงาน'}</span>
          <CheckBadgeIcon className="w-6 h-6" />
        </button>
        
        <PdfPrintButton 
          students={students} 
          lecturers={lecturers} 
          currentUser={currentUser} 
          chairPerson={chairPerson}
          subjectId={subjectId}
        />
        
        <p className="text-center text-slate-400 text-xs mt-6">
          การกดปุ่มบันทึก หมายถึงสมาชิกในกลุ่มทุกคนยอมรับในการเสนอหัวข้อนี้<br/>และระบบจะส่งการแจ้งเตือนไปยังอาจารย์ที่ปรึกษาเพื่อพิจารณา
        </p>
      </div>
    </form>
  );
}