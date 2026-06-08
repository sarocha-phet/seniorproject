import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";
import { 
  ChevronLeftIcon,
  DocumentTextIcon,
  FolderIcon,       
  ChevronDownIcon,
  ArrowDownTrayIcon,
  EyeIcon,
  MagnifyingGlassIcon,
  ClockIcon
} from "@heroicons/react/24/outline";

export default async function AdminDocumentsPage({ 
  searchParams 
}: { 
  searchParams: { uid?: string; q?: string; status?: string } 
}) {
  const resolvedParams = await searchParams;
  const uid = resolvedParams.uid;
  const query = resolvedParams.q || "";
  const statusFilter = resolvedParams.status || "";

  if (!uid) redirect('/login');

  const admin = await prisma.user.findUnique({
    where: { id: uid },
    include: { roles: true }
  });
  const isAdmin = admin?.roles?.some((r) => r.name === 'ADMIN');
  if (!admin || !isAdmin) redirect('/login');

  const projects = await prisma.project.findMany({
    where: {
      AND: [
        {
          OR: [
            { titleTh: { contains: query } },
            { titleEn: { contains: query } },
          ]
        },
        {
          documents: statusFilter ? { some: { status: statusFilter } } : { some: {} }
        }
      ]
    },
    include: {
      documents: {
        where: statusFilter ? { status: statusFilter } : {},
        orderBy: { uploadedAt: 'desc' },
        include: { uploader: true }
      }
    },
    orderBy: { createdAt: 'desc' }
  });

  let totalDocs = 0;
  let pendingDocs = 0;
  let approvedDocs = 0;
  projects.forEach(p => {
    totalDocs += p.documents.length;
    pendingDocs += p.documents.filter((d: any) => d.status === 'PENDING').length;
    approvedDocs += p.documents.filter((d: any) => d.status === 'APPROVED').length;
  });

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center py-10 px-4 font-sans text-slate-900">
      <div className="w-full max-w-[1200px] space-y-8">
        
        {/* --- Header --- */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="min-w-0 flex-1">
            <Link href={`/admin?uid=${uid}`} className="inline-flex items-center gap-2 text-slate-500 hover:text-[#8A151B] transition-colors text-sm font-black mb-4 bg-white px-4 py-2 rounded-full shadow-sm border border-slate-200 w-fit">
              <ChevronLeftIcon className="w-4 h-4" /> กลับไปหน้าแผงควบคุม
            </Link>
            <h1 className="text-3xl font-black text-[#4A151B] flex items-center gap-3 truncate mt-2">
              <div className="p-3 bg-white rounded-2xl shadow-sm border border-red-100">
                <DocumentTextIcon className="w-10 h-10 text-[#8A151B]" />
              </div>
              จัดการเอกสารทั้งหมด
            </h1>
          </div>

          <div className="flex items-center gap-6 bg-white p-6 rounded-[2rem] border border-slate-200 shadow-md shrink-0">
            <div className="text-center px-4 border-r border-slate-100">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">ทั้งหมด</p>
              <p className="text-2xl font-black text-slate-700">{totalDocs}</p>
            </div>
            <div className="text-center px-4 border-r border-slate-100">
              <p className="text-[10px] font-black text-amber-500 uppercase tracking-widest mb-1">รอตรวจ</p>
              <p className="text-2xl font-black text-amber-600">{pendingDocs}</p>
            </div>
            <div className="text-center px-4">
              <p className="text-[10px] font-black text-emerald-500 uppercase tracking-widest mb-1">อนุมัติแล้ว</p>
              <p className="text-2xl font-black text-emerald-600">{approvedDocs}</p>
            </div>
          </div>
        </div>

        {/* --- Toolbar --- */}
        <div className="bg-white p-5 rounded-[2.5rem] shadow-sm border border-slate-200 flex flex-col lg:flex-row gap-5 items-center justify-between">
            <form method="GET" className="relative w-full lg:max-w-md">
              <input type="hidden" name="uid" value={uid} />
              <input type="hidden" name="status" value={statusFilter} />
              <MagnifyingGlassIcon className="w-5 h-5 absolute left-5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input 
                type="text" 
                name="q"
                defaultValue={query}
                placeholder="ค้นหาจากชื่อโครงงาน..."
                className="w-full bg-slate-50 pl-14 pr-6 py-4 rounded-2xl text-sm font-bold text-slate-700 border border-transparent outline-none focus:ring-2 focus:ring-red-100 focus:bg-white focus:border-red-200 transition-all shadow-inner"
              />
            </form>

            <div className="flex flex-wrap gap-2 w-full lg:w-auto">
              {['', 'PENDING', 'APPROVED', 'REJECTED'].map((s) => (
                <Link
                  key={s}
                  href={`/admin/documents?uid=${uid}&status=${s}&q=${query}`}
                  className={`px-6 py-3.5 rounded-2xl text-xs font-black transition-all border whitespace-nowrap shadow-sm ${
                    statusFilter === s 
                    ? 'bg-[#8A151B] text-white border-[#8A151B] shadow-red-100' 
                    : 'bg-white text-slate-500 border-slate-200 hover:border-[#8A151B] hover:text-[#8A151B]'
                  }`}
                >
                  {s === '' ? '📁 ทั้งหมด' : s === 'PENDING' ? '⏳ รอตรวจ' : s === 'APPROVED' ? '✅ อนุมัติ' : '❌ ให้แก้'}
                </Link>
              ))}
            </div>
        </div>

        {/* --- Accordion List --- */}
        <div className="space-y-5">
          {projects.map((project) => (
            <details key={project.id} className="group bg-white rounded-[2.5rem] shadow-sm border border-slate-200 overflow-hidden open:ring-2 open:ring-red-50 transition-all">
              <summary className="px-8 py-7 cursor-pointer list-none flex items-center justify-between hover:bg-red-50/30 transition-colors">
                <div className="flex items-center gap-6 min-w-0">
                  <div className="w-16 h-16 bg-red-50 text-[#8A151B] rounded-2xl flex items-center justify-center shrink-0 border border-red-100 group-open:bg-[#8A151B] group-open:text-white transition-colors shadow-sm">
                    <FolderIcon className="w-8 h-8" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-black text-slate-900 text-xl truncate group-hover:text-[#8A151B] transition-colors">{project.titleTh}</h3>
                    <div className="flex items-center gap-4 mt-1.5">
                      <p className="text-xs font-bold text-slate-400 flex items-center gap-1.5">
                        <DocumentTextIcon className="w-4 h-4" /> เอกสาร <span className="text-slate-700">{project.documents.length}</span> รายการ
                      </p>
                      {project.documents.some((d: any) => d.status === 'PENDING') && (
                         <span className="bg-amber-50 text-amber-600 text-[10px] font-black px-3 py-1 rounded-full border border-amber-100 animate-pulse">
                           ⚠️ มีรายการรอตรวจ
                         </span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="shrink-0 ml-4 bg-slate-50 p-2.5 rounded-full group-open:bg-red-100 transition-colors">
                  <ChevronDownIcon className="w-6 h-6 text-slate-400 group-open:text-[#8A151B] group-open:-rotate-180 transition-all duration-500" />
                </div>
              </summary>
              
              <div className="border-t border-slate-100 bg-slate-50/50 p-8">
                <div className="bg-white rounded-[2rem] border border-slate-200 overflow-hidden shadow-inner">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left table-fixed min-w-[950px]">
                      <thead>
                        {/* ✅ 4. หัวตารางมีสีพื้นหลังเพื่อแยกส่วน */}
                        <tr className="bg-slate-50/80 border-b border-slate-100 uppercase tracking-widest text-[11px] font-black text-slate-500">
                          <th className="px-8 py-5 w-1/3">ชื่อไฟล์เอกสาร</th>
                          <th className="px-8 py-5 w-1/4 text-center">ประเภท / ผู้ส่ง</th>
                          <th className="px-8 py-5 text-center">วันที่อัปโหลด</th>
                          <th className="px-8 py-5 text-center">สถานะ</th>
                          <th className="px-8 py-5 text-right">เครื่องมือ</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-50">
                        {project.documents.map((doc: any) => (
                          <tr key={doc.id} className="hover:bg-red-50/40 transition-colors group">
                            <td className="px-8 py-6">
                              <div className="flex items-center gap-4">
                                <div className="w-10 h-10 bg-white text-slate-400 rounded-xl flex items-center justify-center shrink-0 font-black text-[10px] border border-slate-200 shadow-sm group-hover:border-red-200 group-hover:text-[#8A151B]">
                                  PDF
                                </div>
                                <p className="font-black text-slate-700 text-sm truncate" title={doc.filePath}>
                                  {doc.filePath.split('/').pop()}
                                </p>
                              </div>
                            </td>
                            <td className="px-8 py-6 text-center">
                                <p className="text-xs font-black text-slate-900">{doc.uploader?.firstName} {doc.uploader?.lastName}</p>
                                <span className="text-[10px] bg-slate-100 text-slate-500 px-2.5 py-1 rounded-lg font-mono font-bold mt-1.5 inline-block border border-slate-200">
                                    {doc.fileType}
                                </span>
                            </td>
                            <td className="px-8 py-6 text-center">
                                <p className="text-xs font-bold text-slate-600 flex items-center justify-center gap-1.5">
                                  <ClockIcon className="w-3.5 h-3.5 text-slate-400" />
                                  {new Date(doc.uploadedAt).toLocaleDateString('th-TH')}
                                </p>
                                <p className="text-[10px] font-bold text-slate-400 mt-1">
                                  เวลา {new Date(doc.uploadedAt).toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' })} น.
                                </p>
                            </td>
                            <td className="px-8 py-6 text-center">
                              <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-[10px] font-black border uppercase shadow-sm ${
                                doc.status === 'APPROVED' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                                doc.status === 'REJECTED' ? 'bg-rose-50 text-rose-700 border-rose-200' :
                                'bg-amber-50 text-amber-700 border-amber-200'
                              }`}>
                                {doc.status === 'APPROVED' ? '✅ อนุมัติแล้ว' : doc.status === 'REJECTED' ? '❌ ต้องแก้ไข' : '⏳ รอตรวจ'}
                              </div>
                            </td>
                            <td className="px-8 py-6">
                              <div className="flex justify-end gap-3">
                                <a href={doc.filePath} target="_blank" className="p-2.5 text-blue-600 hover:bg-blue-600 hover:text-white rounded-xl transition-all bg-blue-50 border border-blue-100" title="เปิดดู">
                                  <EyeIcon className="w-5 h-5" />
                                </a>
                                <a href={doc.filePath} download className="p-2.5 text-slate-600 hover:bg-slate-600 hover:text-white rounded-xl transition-all bg-slate-50 border border-slate-200" title="ดาวน์โหลด">
                                  <ArrowDownTrayIcon className="w-5 h-5" />
                                </a>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </details>
          ))}

          {projects.length === 0 && (
            <div className="py-32 text-center bg-white rounded-[3rem] border border-dashed border-slate-300 shadow-inner">
              <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6 border border-slate-100">
                <DocumentTextIcon className="w-12 h-12 text-slate-200" />
              </div>
              <h3 className="text-slate-400 font-black text-xl">ไม่พบข้อมูลเอกสารในระบบ</h3>
              <p className="text-slate-400 font-bold text-sm mt-2 px-6">ลองเปลี่ยนคำค้นหา หรือใช้ตัวกรองสถานะด้านบนเพื่อค้นหาข้อมูลอีกครั้งครับ</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}