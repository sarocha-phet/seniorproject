'use client'

import { useState } from "react";
import { submitExamRequest } from "./actions"; // จะสร้างในขั้นตอนที่ 2
import { PaperAirplaneIcon, CheckCircleIcon } from "@heroicons/react/24/outline";

export default function SubmitExamButton({ projectId, studentId, hasRequested }: { projectId: string, studentId: string, hasRequested: boolean }) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (confirm("คุณแน่ใจหรือไม่ว่าต้องการยื่นขอสอบโครงงาน?\nคำขอจะถูกส่งไปยัง 'อาจารย์ที่ปรึกษา' เพื่อพิจารณาเป็นลำดับแรก")) {
      setIsSubmitting(true);
      try {
        const res = await submitExamRequest(projectId, studentId);
        if (res.success) {
          alert("ยื่นคำขอสอบสำเร็จ! กรุณารอการอนุมัติ");
        } else {
          alert("เกิดข้อผิดพลาด: " + res.error);
        }
      } catch (error) {
        alert("เกิดข้อผิดพลาดในการเชื่อมต่อเซิร์ฟเวอร์");
      }
      setIsSubmitting(false);
    }
  };

  if (hasRequested) {
    return (
      <div className="bg-emerald-50 border border-emerald-200 p-6 rounded-2xl flex items-center justify-between">
        <div>
          <h4 className="font-bold text-emerald-800 flex items-center gap-2">
            <CheckCircleIcon className="w-6 h-6" /> ยื่นคำขอสอบเข้าสู่ระบบแล้ว
          </h4>
          <p className="text-sm text-emerald-600 mt-1">ระบบกำลังดำเนินการตามขั้นตอนการอนุมัติ กรุณาติดตามสถานะที่หน้าแผงควบคุม</p>
        </div>
      </div>
    );
  }

  return (
    <button 
      onClick={handleSubmit}
      disabled={isSubmitting}
      className={`w-full flex items-center justify-center gap-2 px-8 py-4 font-black rounded-2xl transition-all shadow-xl 
        ${isSubmitting ? 'bg-slate-300 text-slate-500 cursor-not-allowed' : 'bg-[#8A151B] text-white hover:bg-slate-900 shadow-red-200 hover:shadow-slate-300 active:scale-95'}`}
    >
      <PaperAirplaneIcon className="w-6 h-6" /> 
      {isSubmitting ? 'กำลังส่งคำขอ...' : 'ยื่นคำขอสอบโครงงาน'}
    </button>
  );
}