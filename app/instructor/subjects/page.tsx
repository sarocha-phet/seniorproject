import { prisma } from "@/lib/prisma";
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createSubject } from './actions'
import { 
  ChevronLeftIcon, 
  BookOpenIcon, 
  PlusCircleIcon,
  CalendarDaysIcon
} from "@heroicons/react/24/outline";

export default async function CreateSubjectPage({
  searchParams
}: {
  searchParams: Promise<{ uid?: string }>
}) {
  const resolvedSearchParams = await searchParams;
  const uid = resolvedSearchParams.uid;

  if (!uid) redirect('/login');

  // ดึงข้อมูล "ปีการศึกษา" ที่มีอยู่จริง
  const existingYears = await prisma.subject.findMany({
    select: { academicYear: true },
    distinct: ['academicYear'],
    orderBy: { academicYear: 'desc' },
  });

  const yearOptions = existingYears.length > 0 
    ? existingYears.map(s => s.academicYear)
    : [2568, 2567, 2566];

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col items-center py-10 px-4 font-sans text-slate-800">
      <div className="w-full max-w-3xl bg-white shadow-[0_10px_40px_rgba(0,0,0,0.08)] rounded-[2.5rem] overflow-hidden border border-slate-100">

        {/* --- Header --- */}
        <div className="bg-[#8A151B] px-8 py-8 text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none"></div>

          <div className="flex justify-between items-center mb-4 relative z-10">
            <Link href={`/instructor?uid=${uid}&tab=subjects`} className="flex items-center gap-2 text-red-200 hover:text-white transition-colors text-sm font-bold bg-white/10 px-4 py-2 rounded-xl backdrop-blur-sm w-fit border border-white/10">
              <ChevronLeftIcon className="w-4 h-4" /> ยกเลิกและกลับไปหน้าจัดการรายวิชา
            </Link>
          </div>

          <h1 className="text-3xl font-black flex items-center gap-3 relative z-10">
            <BookOpenIcon className="w-8 h-8" />
            สร้างรายวิชาใหม่
          </h1>
          <p className="text-red-200 mt-2 relative z-10">เพิ่มรายวิชาโครงงานเข้าสู่ระบบ พร้อมกำหนดวันสอบไฟนอล</p>
        </div>

        {/* --- Form --- */}
        <div className="p-8 lg:p-12">
          <form action={createSubject} className="space-y-6 bg-slate-50 p-6 lg:p-8 rounded-3xl border border-slate-100">
            
            <input type="hidden" name="instructorId" value={uid} />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">รหัสวิชา (Subject Code) <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  name="subjectCode"
                  required
                  placeholder="เช่น EN813702"
                  className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-red-100 focus:border-[#8A151B] outline-none transition-all font-bold text-slate-800 uppercase"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">สาขาวิชา (Major) <span className="text-red-500">*</span></label>
                <select
                  name="major"
                  required
                  defaultValue="CE"
                  className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-red-100 focus:border-[#8A151B] outline-none transition-all font-bold text-slate-800"
                >
                  {/* ✅ ฟิกซ์ตัวเลือกให้ตรงกับ Enum ในฐานข้อมูลที่คุณส่งภาพมาให้แบบเป๊ะๆ! */}
                  <option value="CE">วิศวกรรมคอมพิวเตอร์ (CE)</option>
                  <option value="ME">วิศวกรรมเครื่องกล (ME)</option>
                  <option value="IE">วิศวกรรมอุตสาหการ (IE)</option>
                  <option value="LE">วิศวกรรมโลจิสติกส์ (LE)</option>
                  <option value="MCE">วิศวกรรมเมคคาทรอนิกส์ (MCE)</option>
                  <option value="AE">วิศวกรรมยานยนต์ (AE)</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">ปีการศึกษา <span className="text-red-500">*</span></label>
                <select
                  name="academicYear"
                  required
                  className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-red-100 focus:border-[#8A151B] outline-none transition-all font-bold text-slate-800"
                >
                  {yearOptions.map(year => (
                    <option key={year} value={year}>{year}</option>
                  ))}
                </select>
              </div>

              <div>
                {/* ภาคเรียนเป็นช่องพิมพ์ตัวเลข */}
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">ภาคเรียน (Semester) <span className="text-red-500">*</span></label>
                <input
                  type="number"
                  name="semester"
                  required
                  min="1"
                  placeholder="เช่น 1, 2 หรือ 3"
                  className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-red-100 focus:border-[#8A151B] outline-none transition-all font-bold text-slate-800"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">ชื่อรายวิชา (ภาษาไทย) <span className="text-red-500">*</span></label>
              <input
                type="text"
                name="nameTh"
                required
                placeholder="เช่น โครงงานวิศวกรรมคอมพิวเตอร์ 2"
                className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-red-100 focus:border-[#8A151B] outline-none transition-all font-bold text-slate-800"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">ชื่อรายวิชา (ภาษาอังกฤษ)</label>
              <input
                type="text"
                name="nameEn"
                placeholder="เช่น Computer Engineering Project II"
                className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-red-100 focus:border-[#8A151B] outline-none transition-all text-slate-700"
              />
            </div>

            {/* ช่องกรอกวันสอบไฟนอล */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200">
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-2">
                <CalendarDaysIcon className="w-4 h-4 text-[#8A151B]" />
                กำหนดวันสอบไฟนอลโปรเจค (ตั้งค่าภายหลังได้)
              </label>
              <input
                type="datetime-local"
                name="finalExamDate"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-red-100 focus:border-[#8A151B] outline-none transition-all text-slate-700"
              />
              <p className="text-[10px] text-slate-400 mt-2">* หากปล่อยว่างไว้ ระบบจะแสดงสถานะ "ยังไม่กำหนดวันสอบ" ให้นักศึกษาเห็น</p>
            </div>

            <div className="pt-6 border-t border-slate-200 flex flex-col sm:flex-row gap-4 justify-end">
              <Link
                href={`/instructor?uid=${uid}&tab=subjects`}
                className="px-8 py-3.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition-colors text-center"
              >
                ยกเลิก
              </Link>
              <button
                type="submit"
                className="px-10 py-3.5 bg-[#8A151B] hover:bg-slate-900 text-white font-bold rounded-xl shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2"
              >
                <PlusCircleIcon className="w-5 h-5" /> บันทึกรายวิชา
              </button>
            </div>
            
          </form>
        </div>

      </div>
    </div>
  )
}