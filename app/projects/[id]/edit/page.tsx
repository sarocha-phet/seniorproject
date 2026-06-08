import { prisma } from '@/lib/prisma'
import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import { updateProjectDetails } from '../../actions'
import { 
  ChevronLeftIcon,
  PencilSquareIcon,
  DocumentTextIcon,
  FolderOpenIcon
} from "@heroicons/react/24/outline";

export default async function EditProjectPage({ 
  params,
  searchParams
}: { 
  params: Promise<{ id: string }>,
  searchParams: Promise<{ uid?: string; role?: string }> // ✅ 1. เพิ่ม role ตรงนี้
}) {
  const { id } = await params;
  const resolvedSearchParams = await searchParams;
  const uid = resolvedSearchParams.uid;
  const role = resolvedSearchParams.role || 'STUDENT'; // ✅ 2. รับค่า role (ถ้าไม่มีให้เป็น STUDENT)

  if (!uid) redirect('/login');

  // ดึงข้อมูลเดิมมาแสดงในฟอร์ม
  const project = await prisma.project.findUnique({
    where: { id },
  });

  if (!project) notFound();

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col items-center py-10 px-4 font-sans text-slate-800">
      
      <div className="w-full max-w-4xl bg-white shadow-[0_10px_40px_rgba(0,0,0,0.08)] rounded-[2.5rem] overflow-hidden border border-slate-100">
        
        {/* --- Header --- */}
        <div className="bg-[#8A151B] px-8 py-8 text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none"></div>
          
          <div className="flex justify-between items-center mb-4 relative z-10">
            {/* ✅ 3. แนบ &role=${role} กลับไปด้วยตอนกดยกเลิก */}
            <Link href={`/projects/${id}?uid=${uid}&role=${role}`} className="flex items-center gap-2 text-red-200 hover:text-white transition-colors text-sm font-bold bg-white/10 px-4 py-2 rounded-xl backdrop-blur-sm w-fit border border-white/10">
              <ChevronLeftIcon className="w-4 h-4" /> ยกเลิกและกลับไปหน้าเดิม
            </Link>
          </div>
          
          <h1 className="text-3xl font-black flex items-center gap-3 relative z-10">
            <PencilSquareIcon className="w-8 h-8" />
            แก้ไขข้อมูลโครงงาน
          </h1>
          <p className="text-red-200 mt-2 relative z-10">รหัสโครงงาน: {project.projectCode || "ไม่ระบุรหัส"}</p>
        </div>

        {/* --- Form --- */}
        <div className="p-8 lg:p-12">
          <form action={updateProjectDetails} className="space-y-8">
            
            <input type="hidden" name="projectId" value={project.id} />
            <input type="hidden" name="uid" value={uid} />
            <input type="hidden" name="role" value={role} /> {/* ✅ 4. ซ่อนค่า role ส่งไปให้ actions.ts เพื่อให้ตอนเซฟเสร็จเด้งกลับถูกหน้า */}

            <div className="space-y-6 bg-slate-50 p-6 lg:p-8 rounded-3xl border border-slate-100">
              <h3 className="font-bold text-slate-800 flex items-center gap-2 border-b border-slate-200 pb-4">
                <DocumentTextIcon className="w-5 h-5 text-[#8A151B]" /> ชื่อโครงงาน
              </h3>
              
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">ชื่อโครงงาน (ภาษาไทย) <span className="text-red-500">*</span></label>
                <input 
                  type="text" 
                  name="titleTh"
                  defaultValue={project.titleTh}
                  required
                  className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-red-100 focus:border-[#8A151B] outline-none transition-all font-bold text-slate-800"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">ชื่อโครงงาน (ภาษาอังกฤษ)</label>
                <input 
                  type="text" 
                  name="titleEn"
                  defaultValue={project.titleEn || ""}
                  className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-red-100 focus:border-[#8A151B] outline-none transition-all text-slate-700"
                />
              </div>
            </div>

            <div className="space-y-6 bg-slate-50 p-6 lg:p-8 rounded-3xl border border-slate-100">
              <h3 className="font-bold text-slate-800 flex items-center gap-2 border-b border-slate-200 pb-4">
                <FolderOpenIcon className="w-5 h-5 text-[#8A151B]" /> รายละเอียดเพิ่มเติม
              </h3>
              
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">บทคัดย่อ (Abstract)</label>
                <textarea 
                  name="abstract"
                  defaultValue={project.abstract || ""}
                  rows={5}
                  className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-red-100 focus:border-[#8A151B] outline-none transition-all text-slate-700 resize-none leading-relaxed"
                  placeholder="เพิ่มบทคัดย่อของโครงงานที่นี่..."
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">ขอบเขตโครงงาน (Project Scope)</label>
                <textarea 
                  name="scope"
                  defaultValue={project.scope || ""}
                  rows={4}
                  className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-red-100 focus:border-[#8A151B] outline-none transition-all text-slate-700 resize-none leading-relaxed"
                  placeholder="ระบุขอบเขตการทำงานของโครงงาน..."
                />
              </div>
            </div>

            <div className="pt-6 border-t border-slate-100 flex flex-col sm:flex-row gap-4 justify-end">
              {/* ✅ 5. แนบ &role=${role} กลับไปด้วยตอนกดยกเลิก */}
              <Link 
                href={`/projects/${id}?uid=${uid}&role=${role}`}
                className="px-8 py-3.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition-colors text-center"
              >
                ยกเลิก
              </Link>
              <button 
                type="submit"
                className="px-10 py-3.5 bg-[#8A151B] hover:bg-slate-900 text-white font-bold rounded-xl shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2"
              >
                <PencilSquareIcon className="w-5 h-5" /> บันทึกการแก้ไข
              </button>
            </div>

          </form>
        </div>

      </div>
    </div>
  )
}