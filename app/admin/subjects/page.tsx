import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";
import { 
  ChevronLeftIcon,
  BookOpenIcon,
  MagnifyingGlassIcon,
  UserGroupIcon,
  TrashIcon,
  CalendarIcon
} from "@heroicons/react/24/outline";

export default async function AdminSubjectsPage({ 
  searchParams 
}: { 
  searchParams: { uid?: string; q?: string } 
}) {
  const resolvedParams = await searchParams;
  const uid = resolvedParams.uid;
  const query = resolvedParams.q || "";

  if (!uid) redirect('/login');

  // ตรวจสอบสิทธิ์ Admin
  const admin = await prisma.user.findUnique({
    where: { id: uid },
    include: { roles: true }
  });
  const isAdmin = admin?.roles?.some((r: any) => r.name === 'ADMIN');
  if (!admin || !isAdmin) redirect('/login');

  // ดึงข้อมูลรายวิชาทั้งหมด
  const subjects = await prisma.subject.findMany({
    where: {
      OR: [
        { nameTh: { contains: query } },
        { subjectCode: { contains: query } }
      ]
    },
    include: {
      _count: {
        select: { projects: true }
      }
    },
    orderBy: { academicYear: 'desc' }
  });

  return (
    <div className="min-h-screen bg-[#FDFBFB] flex flex-col items-center py-10 px-4 font-sans text-slate-900 overflow-x-hidden">
      <div className="w-full max-w-[1200px] space-y-8">
        
        {/* --- Header --- */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="min-w-0 flex-1">
            <Link href={`/admin?uid=${uid}`} className="inline-flex items-center gap-2 text-slate-500 hover:text-[#8A151B] transition-colors text-sm font-bold mb-4">
              <ChevronLeftIcon className="w-4 h-4" /> กลับไปหน้าแผงควบคุม
            </Link>
            <h1 className="text-3xl font-black text-[#4A151B] flex items-center gap-3 truncate">
              <BookOpenIcon className="w-10 h-10 text-[#8A151B] shrink-0" />
              จัดการรายวิชาทั้งหมด
            </h1>
            <p className="text-slate-600 mt-1 font-medium">จัดการข้อมูลหลักสูตรและรายวิชาโครงงานในระบบ</p>
          </div>
          {/* ✅ ปุ่มเพิ่มรายวิชาใหม่ถูกนำออกแล้ว */}
        </div>

        {/* --- Search Bar --- */}
        <div className="bg-white p-4 rounded-[2rem] shadow-sm border border-slate-100 flex gap-4 min-w-0">
          <div className="flex-1 relative min-w-0">
            <MagnifyingGlassIcon className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
            <form action="" method="GET">
                <input type="hidden" name="uid" value={uid} />
                <input 
                  type="text" 
                  name="q"
                  defaultValue={query}
                  placeholder="ค้นหาด้วยรหัสวิชา หรือชื่อวิชา..." 
                  className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-2 focus:ring-red-100 transition-all text-sm font-semibold text-slate-900 truncate"
                />
            </form>
          </div>
        </div>

        {/* --- Subjects Table --- */}
        <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left table-fixed">
              <thead>
                <tr className="bg-slate-100 border-b border-slate-200 uppercase tracking-widest text-[11px] font-black text-slate-700">
                  <th className="px-8 py-5 w-1/3">ข้อมูลรายวิชา</th>
                  <th className="px-8 py-5 text-center w-1/4">กำหนดการสอบ</th>
                  <th className="px-8 py-5 text-center">โครงงาน</th>
                  <th className="px-8 py-5 text-right">จัดการ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {subjects.map((sub) => (
                  <tr key={sub.id} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="px-8 py-6 min-w-0">
                      <div className="flex items-center gap-4 min-w-0">
                        <div className="w-12 h-12 bg-red-50 text-[#8A151B] rounded-2xl flex items-center justify-center shrink-0 border border-red-100 font-black">
                          {sub.subjectCode.substring(0, 2)}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="font-bold text-slate-950 text-base truncate" title={sub.nameTh}>{sub.nameTh}</p>
                          <p className="text-sm font-mono text-slate-600 uppercase tracking-wider truncate font-semibold">{sub.subjectCode}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6 min-w-0 text-center">
                      {sub.finalExamDate ? (
                        <div className="inline-flex items-center gap-2 bg-emerald-50 text-emerald-800 px-3 py-1.5 rounded-lg border border-emerald-100">
                          <CalendarIcon className="w-4 h-4" />
                          <p className="text-xs font-bold truncate">
                            {new Date(sub.finalExamDate).toLocaleDateString('th-TH', { day: 'numeric', month: 'long', year: 'numeric' })}
                          </p>
                        </div>
                      ) : (
                        <p className="text-xs text-slate-500 italic">ยังไม่ประกาศ</p>
                      )}
                    </td>
                    <td className="px-8 py-6 text-center">
                      <div className="flex flex-col items-center">
                        <span className="text-lg font-black text-slate-950">{sub._count.projects}</span>
                        <span className="text-[10px] font-bold text-slate-600 uppercase">กลุ่ม</span>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex justify-end gap-2">
                        <Link 
                          href={`/instructor/subjects/${sub.id}?uid=${uid}`}
                          className="p-2.5 text-blue-700 hover:bg-blue-100 rounded-xl transition-colors"
                          title="ดูรายละเอียดกลุ่ม"
                        >
                          <UserGroupIcon className="w-5 h-5" />
                        </Link>
                        <button className="p-2.5 text-rose-700 hover:bg-rose-100 rounded-xl transition-colors" title="ลบรายวิชา">
                          <TrashIcon className="w-5 h-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}