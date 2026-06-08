import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";
import ExamPdfPrintButton from "./ExamPdfPrintButton";
import SubmitExamButton from "./SubmitExamButton"; 
import { 
  ChevronLeftIcon,
  AcademicCapIcon,
  DocumentCheckIcon,
  ExclamationTriangleIcon
} from "@heroicons/react/24/outline";

export default async function ExamRequestPage({ 
  searchParams 
}: { 
  searchParams: { uid?: string } 
}) {
  const resolvedParams = await searchParams;
  const uid = resolvedParams.uid;

  if (!uid) redirect('/login');

  // ดึงข้อมูล User และโครงงานที่กำลังทำอยู่
  const user = await prisma.user.findUnique({
    where: { id: uid },
    include: {
      projects: {
        include: { 
          project: {
            include: {
              members: { include: { user: true } },
              advisors: { include: { user: true } }
            }
          } 
        }
      }
    }
  });

  if (!user) redirect('/login');

  const activeProject = user.projects[0]?.project;

  // จัดเรียงให้สมาชิกคนที่ Login อยู่ (uid) ขึ้นเป็นคนแรกเสมอ
  if (activeProject && activeProject.members) {
    activeProject.members.sort((a: any, b: any) => {
      if (a.userId === uid) return -1;
      if (b.userId === uid) return 1;
      return 0;
    });
  }

  // ดึงข้อมูลประธานหลักสูตร (เอาไปใส่ใน PDF)
  const chairs = await prisma.user.findMany({
    where: { roles: { some: { name: 'CHAIR' } } }
  });
  const chairPerson = chairs.length > 0 ? chairs[0] : null;

  // เช็คว่าเคยกดยื่นขอสอบไปแล้วหรือยัง
  let hasRequestedExam = false;
  if (activeProject) {
    const existingRequest = await prisma.document.findFirst({
      where: {
        projectId: activeProject.id,
        fileType: "ยื่นขอสอบโครงงาน"
      }
    });
    if (existingRequest) hasRequestedExam = true;
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col items-center py-10 px-4 font-sans">
      <div className="w-full max-w-3xl bg-white shadow-[0_10px_40px_rgba(0,0,0,0.08)] rounded-[2.5rem] overflow-hidden border border-slate-100">
        
        <div className="bg-[#8A151B] px-8 py-8 text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3"></div>
          <div className="flex justify-between items-center mb-2 relative z-10">
            <Link href={`/student?uid=${uid}`} className="flex items-center gap-1 text-red-50 hover:text-white transition text-sm font-bold">
              <ChevronLeftIcon className="w-4 h-4" /> กลับหน้าหลัก
            </Link>
            <span className="text-red-100 text-xs font-bold uppercase tracking-widest">Exam Request</span>
          </div>
          <h1 className="text-3xl font-black flex items-center gap-3 relative z-10 text-white">
            <DocumentCheckIcon className="w-10 h-10" />
            ยื่นขออนุญาตขึ้นสอบโครงงาน
          </h1>
        </div>

        <div className="p-8 lg:p-12 space-y-8">
          
          {!activeProject ? (
            <div className="bg-amber-50 border border-amber-300 p-8 rounded-2xl text-center shadow-sm">
              <ExclamationTriangleIcon className="w-12 h-12 text-amber-600 mx-auto mb-4" />
              <h3 className="text-lg font-black text-amber-800">ไม่พบโครงงานที่กำลังดำเนินการ</h3>
              <p className="text-sm font-medium text-amber-700 mt-2">คุณต้องเสนอหัวข้อโครงงานให้ผ่านการอนุมัติก่อน จึงจะสามารถขอสอบได้</p>
            </div>
          ) : (
            <>
              <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 shadow-sm">
                <h3 className="text-sm font-black text-slate-600 uppercase tracking-widest mb-5 border-b border-slate-200 pb-2">ข้อมูลโครงงานปัจจุบัน</h3>
                <div className="space-y-5">
                  <div>
                    <p className="text-xs text-slate-600 font-bold mb-1">ชื่อโครงงาน (ภาษาไทย)</p>
                    <p className="text-slate-900 font-black text-lg">{activeProject.titleTh}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-600 font-bold mb-1">ชื่อโครงงาน (ภาษาอังกฤษ)</p>
                    <p className="text-slate-700 font-semibold">{activeProject.titleEn || "-"}</p>
                  </div>
                  <div className="pt-5 border-t border-slate-200">
                    <p className="text-xs text-slate-600 font-bold mb-3">กลุ่มนักศึกษา</p>
                    <div className="flex flex-wrap gap-2">
                      {activeProject.members.map((m: any, idx: number) => (
                        <span 
                          key={m.id} 
                          className={`border px-3 py-2 rounded-lg text-sm font-bold shadow-sm
                            ${idx === 0 
                              ? 'bg-red-50 border-red-300 text-[#8A151B]'
                              : 'bg-white border-slate-300 text-slate-800'
                            }`}
                        >
                          {m.user.firstName} {m.user.lastName} {idx === 0 && "(คุณ)"}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 p-6 rounded-2xl flex gap-4 items-start shadow-sm">
                <AcademicCapIcon className="w-6 h-6 text-blue-700 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-black text-blue-900 mb-2">ขั้นตอนการขอสอบ</h4>
                  <ul className="text-sm font-medium text-blue-800 space-y-2 list-disc ml-5 leading-relaxed">
                    <li>กดปุ่มยื่นคำขอสอบออนไลน์ด้านล่าง เพื่อส่งเรื่องเข้าสู่ระบบ</li>
                    <li>ระบบจะแจ้งเตือนไปยัง <b className="text-blue-900">อาจารย์ที่ปรึกษา</b> เพื่ออนุมัติ</li>
                    <li>จากนั้นระบบจะส่งเรื่องต่อไปยัง <b className="text-blue-900">ประธานหลักสูตร</b></li>
                    <li>เมื่อผ่านครบทุกขั้นตอน ระบบจะแจ้งเตือนให้คุณและอาจารย์ประจำวิชาทราบ</li>
                  </ul>
                </div>
              </div>

              <div className="pt-4">
                <SubmitExamButton projectId={activeProject.id} studentId={uid} hasRequested={hasRequestedExam} />
              </div>

              <div>
                <ExamPdfPrintButton project={activeProject} chairPerson={chairPerson} />
              </div>
            </>
          )}

        </div>
      </div>
    </div>
  );
}