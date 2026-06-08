import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { 
  ChevronLeftIcon, 
  ChatBubbleLeftRightIcon, 
  ClockIcon, 
  UserGroupIcon,
  AcademicCapIcon
} from "@heroicons/react/24/outline";

export default async function ProjectDetailPage({ 
  params, 
  searchParams 
}: { 
  params: { id: string }; 
  searchParams: { uid?: string } 
}) {
  const resolvedParams = await params;
  const resolvedSearch = await searchParams;
  const projectId = resolvedParams.id;
  const uid = resolvedSearch.uid;

  let backLink = '/'; 

  if (uid && uid !== 'undefined' && uid !== 'null' && uid.trim() !== '') {
    const currentUser = await prisma.user.findUnique({
      where: { id: uid },
      include: { roles: true }
    });
    
    if (currentUser && currentUser.roles.length > 0) {
      const role = currentUser.roles[0].name;
      
      if (role === 'STUDENT') backLink = `/student?uid=${uid}`;
      else if (role === 'INSTRUCTOR') backLink = `/instructor?uid=${uid}`;
      else if (role === 'ADVISOR') backLink = `/lecturer?uid=${uid}`;
      else if (role === 'CHAIR') backLink = `/head?uid=${uid}`;
      else if (role === 'ADMIN') backLink = `/admin/projects?uid=${uid}`;
    }
  }

  const project = await prisma.project.findUnique({
    where: { id: projectId },
    include: {
      subject: true,
      members: { include: { user: true } },
      advisors: { include: { user: true } },
      logs: { 
        include: { user: true },
        orderBy: { createdAt: 'desc' } 
      },
      comments: { 
        include: { user: true },
        orderBy: { createdAt: 'desc' } 
      }
    }
  });

  if (!project) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center p-10 bg-white rounded-3xl border border-slate-200 shadow-md">
           <h2 className="text-xl font-bold text-slate-700 mb-2">ไม่พบข้อมูลโครงงาน</h2>
           <Link href={backLink} className="text-[#8A151B] hover:underline text-sm font-bold">
             คลิกเพื่อกลับหน้าหลัก
           </Link>
        </div>
      </div>
    );
  }

  return (
    // ✅ ปรับพื้นหลังหลักให้เป็นสีเทาอ่อน (slate-50) เพื่อให้ตัดกับกล่องสีขาว
    <div className="min-h-screen bg-slate-50 py-10 px-4 font-sans text-slate-900">
      <div className="w-full max-w-[1100px] mx-auto space-y-8">
        
        {/* --- Navigation --- */}
        <Link href={backLink} className="inline-flex items-center gap-2 text-slate-500 hover:text-[#8A151B] transition-colors text-sm font-bold bg-white px-4 py-2 rounded-full shadow-sm border border-slate-200 w-fit">
          <ChevronLeftIcon className="w-4 h-4" /> กลับไปหน้าก่อนหน้า
        </Link>

        {/* --- Project Header Card --- */}
        {/* ✅ เพิ่มแถบสีแดงด้านบน (border-t-[12px]) และเพิ่มเงาให้ชัดขึ้น */}
        <div className="bg-white rounded-[2.5rem] p-8 lg:p-10 border border-slate-200 shadow-lg relative overflow-hidden border-t-[12px] border-t-[#8A151B]">
          <div className="absolute top-6 right-8">
            <span className={`px-5 py-2 rounded-full text-xs font-black uppercase tracking-widest border shadow-sm ${
                project.status === 'APPROVED' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                'bg-amber-50 text-amber-700 border-amber-200'
            }`}>
              {project.status}
            </span>
          </div>
          
          <div className="space-y-4 max-w-[85%] mt-4">
            <p className="inline-block px-4 py-1.5 bg-red-50 text-[#8A151B] rounded-lg text-sm font-black uppercase tracking-widest border border-red-100">
              {project.subject?.subjectCode} | {project.subject?.nameTh}
            </p>
            <h1 className="text-3xl lg:text-4xl font-black text-slate-900 leading-tight mt-4">{project.titleTh}</h1>
            <p className="text-lg font-bold text-slate-500 italic uppercase">{project.titleEn}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-12 pt-8 border-t border-slate-200">
            <div className="space-y-4">
              <h4 className="text-sm font-black text-slate-800 uppercase tracking-widest flex items-center gap-2 bg-slate-100 w-fit px-4 py-2 rounded-xl">
                <UserGroupIcon className="w-5 h-5 text-slate-500" /> คณะผู้จัดทำ
              </h4>
              <div className="flex flex-col gap-3 mt-4">
                {project.members.map((m: any) => (
                  // ✅ ปรับกล่องรายชื่อให้ดูเป็นมิติมากขึ้น
                  <div key={m.userId} className="flex items-center gap-4 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                    <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center font-black text-xs text-slate-500">
                      {m.user.username.substring(0, 2)}
                    </div>
                    <div>
                      <p className="text-base font-black text-slate-900">{m.user.firstName} {m.user.lastName}</p>
                      <p className="text-[11px] font-bold text-slate-400 uppercase mt-0.5">{m.user.username}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="text-sm font-black text-slate-800 uppercase tracking-widest flex items-center gap-2 bg-red-50 w-fit px-4 py-2 rounded-xl text-[#8A151B]">
                <AcademicCapIcon className="w-5 h-5 text-[#8A151B]" /> อาจารย์ที่ปรึกษา
              </h4>
              <div className="flex flex-col gap-3 mt-4">
                {project.advisors.map((adv: any) => (
                  // ✅ ปรับกล่องอาจารย์ให้สีชัดเจนขึ้น
                  <div key={adv.userId} className="flex items-center gap-4 bg-[#FDF8F8] p-4 rounded-2xl border border-red-100 shadow-sm hover:shadow-md transition-shadow">
                    <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center font-black text-xs text-[#8A151B] shadow-sm border border-red-50">
                      AD
                    </div>
                    <div>
                      <p className="text-base font-black text-[#8A151B]">{adv.user.firstName} {adv.user.lastName}</p>
                      <p className="text-[11px] font-bold text-red-400 uppercase mt-0.5">{adv.role}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* --- Logs & Comments Section --- */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-8">
          
          {/* Timeline (Logs) */}
          <div className="lg:col-span-2 space-y-6">
            <h3 className="text-xl font-black text-slate-900 flex items-center gap-2 bg-white px-6 py-3 rounded-2xl border border-slate-200 shadow-sm w-fit">
              <ClockIcon className="w-6 h-6 text-[#8A151B]" /> ประวัติความเคลื่อนไหว
            </h3>
            <div className="space-y-5 relative before:absolute before:inset-0 before:ml-[1.15rem] before:-translate-x-px before:h-full before:w-0.5 before:bg-slate-300">
              {project.logs.map((log: any) => (
                <div key={log.id} className="relative flex items-start gap-6 group">
                  <div className="absolute left-0 w-10 h-10 bg-slate-50 rounded-full border-[3px] border-white shadow-md flex items-center justify-center z-10 group-hover:bg-[#8A151B] transition-colors">
                    <div className="w-2.5 h-2.5 bg-slate-300 rounded-full group-hover:bg-white transition-colors" />
                  </div>
                  {/* ✅ ปรับกล่องประวัติให้เด่นขึ้น */}
                  <div className="ml-14 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow flex-1">
                    <div className="flex justify-between items-start mb-2">
                      <p className="text-base font-black text-slate-900">{log.action}</p>
                      <time className="text-[11px] font-bold text-slate-400 uppercase bg-slate-50 px-3 py-1 rounded-full">
                        {new Date(log.createdAt).toLocaleDateString('th-TH')}
                      </time>
                    </div>
                    <p className="text-sm font-medium text-slate-600 leading-relaxed">{log.details}</p>
                    <p className="text-[10px] font-black text-[#8A151B] mt-3 uppercase inline-flex items-center gap-1 bg-red-50 px-2.5 py-1 rounded-md">
                      โดย: {log.user.firstName}
                    </p>
                  </div>
                </div>
              ))}
              {project.logs.length === 0 && (
                <div className="ml-14 text-center py-8 bg-white rounded-3xl border border-dashed border-slate-300 shadow-sm">
                  <p className="text-sm font-bold text-slate-400 italic">ยังไม่มีประวัติความเคลื่อนไหว</p>
                </div>
              )}
            </div>
          </div>

          {/* Comments Sidebar */}
          <div className="space-y-6">
            <h3 className="text-xl font-black text-slate-900 flex items-center gap-2 bg-white px-6 py-3 rounded-2xl border border-slate-200 shadow-sm w-fit">
              <ChatBubbleLeftRightIcon className="w-6 h-6 text-[#8A151B]" /> ความคิดเห็น
            </h3>
            <div className="space-y-4">
              {project.comments.map((comment: any) => (
                <div key={comment.id} className="bg-white p-6 rounded-[2rem] border-l-[6px] border-l-[#8A151B] shadow-sm hover:shadow-md transition-shadow border border-slate-200">
                  <p className="text-sm font-bold text-slate-700 leading-relaxed italic">"{comment.message}"</p>
                  <div className="mt-4 pt-4 border-t border-slate-100 flex justify-between items-center">
                    <p className="text-[11px] font-black text-slate-900 uppercase bg-slate-100 px-2 py-1 rounded">
                      {comment.user.firstName}
                    </p>
                    <p className="text-[10px] font-bold text-slate-400">
                      {new Date(comment.createdAt).toLocaleDateString('th-TH')}
                    </p>
                  </div>
                </div>
              ))}
              {project.comments.length === 0 && (
                <div className="text-center py-12 bg-white rounded-[2rem] border border-dashed border-slate-300 shadow-sm">
                  <p className="text-sm font-bold text-slate-400 italic">ยังไม่มีความคิดเห็น</p>
                </div>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}