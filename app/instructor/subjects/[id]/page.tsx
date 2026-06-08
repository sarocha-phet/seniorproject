import { prisma } from '@/lib/prisma'
import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import { setFinalExamDate } from '../actions'
import {
  ChevronLeftIcon,
  UserGroupIcon,
  CalendarDaysIcon,
  MegaphoneIcon,
  UserIcon
} from "@heroicons/react/24/outline";

export default async function SubjectDetailPage({
  params,
  searchParams
}: {
  params: Promise<{ id: string }>,
  searchParams: Promise<{ uid?: string }>
}) {
  const { id } = await params;
  const resolvedSearchParams = await searchParams;
  const uid = resolvedSearchParams.uid;

  if (!uid) redirect('/login');

  const currentUser = await prisma.user.findUnique({
    where: { id: uid },
    include: { roles: true }
  });
  const currentRole = currentUser?.roles[0]?.name;

  let backUrl = `/instructor?uid=${uid}&tab=subjects`;
  if (currentRole === 'ADMIN') backUrl = `/admin?uid=${uid}`;
  if (currentRole === 'CHAIR') backUrl = `/head?uid=${uid}&tab=overview`;
  if (currentRole === 'ADVISOR') backUrl = `/lecturer?uid=${uid}&tab=overview`;

  const subject = await prisma.subject.findUnique({
    where: { id },
    include: {
      projects: {
        include: {
          members: {
            include: {
              user: true
            }
          }
        }
      }
    }
  });

  if (!subject) notFound();

  const formatFullNameWithPrefix = (user: any) => {
    if (!user) return "ไม่ระบุชื่อ";
    const prefix = user.titlePrefix || "";
    return `${prefix}${user.firstName} ${user.lastName}`.trim();
  };

  const allStudents = subject.projects.flatMap(project =>
    project.members.map(member => member.user)
  );

  const defaultExamDate = subject.finalExamDate
    ? new Date(subject.finalExamDate.getTime() - subject.finalExamDate.getTimezoneOffset() * 60000).toISOString().slice(0, 16)
    : "";

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col items-center py-10 px-4 font-sans text-slate-800">
      <div className="w-full max-w-[1000px] space-y-6">

        {/* --- Header --- */}
        <div className="bg-white shadow-sm rounded-[2.5rem] overflow-hidden border border-slate-100">
          <div className="bg-[#8A151B] px-8 py-8 text-white relative overflow-hidden">
            <div className="flex justify-between items-center mb-6 relative z-10">
              <Link href={backUrl} className="flex items-center gap-2 text-red-200 hover:text-white transition-colors text-sm font-bold bg-white/10 px-4 py-2 rounded-xl backdrop-blur-sm border border-white/10">
                <ChevronLeftIcon className="w-4 h-4" /> ย้อนกลับ
              </Link>
            </div>
            <div className="relative z-10">
              <span className="bg-white text-[#8A151B] text-xs font-black px-3 py-1.5 rounded-lg font-mono mb-3 inline-block">
                {subject.subjectCode}
              </span>
              <h1 className="text-3xl font-black mb-1">{subject.nameTh}</h1>
              <p className="text-red-200 text-sm italic">รายชื่อนักศึกษาและสาขาวิชา</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* ================= ส่วนแสดงรายชื่อนักศึกษา ================= */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 overflow-hidden">
              <div className="px-8 py-6 border-b border-slate-100 bg-slate-50/50">
                <h3 className="font-black text-slate-800 flex items-center gap-2">
                  <UserGroupIcon className="w-6 h-6 text-blue-600" />
                  รายชื่อนักศึกษา ({allStudents.length} คน)
                </h3>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="text-[11px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">
                      <th className="px-8 py-4">fullName (ชื่อ-นามสกุล)</th>
                      <th className="px-8 py-4">department (สาขาวิชา)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {allStudents.length > 0 ? (
                      allStudents.map((student) => (
                        <tr key={student.id} className="hover:bg-slate-50/50 transition-colors">
                          <td className="px-8 py-4">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
                                <UserIcon className="w-4 h-4" />
                              </div>
                              <span className="text-sm font-bold text-slate-700">
                                {formatFullNameWithPrefix(student)}
                              </span>
                            </div>
                          </td>
                          <td className="px-8 py-4">
                            <span className="text-xs font-medium text-slate-500 lowercase">
                              {student.department || "computerengineering"}
                            </span>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={2} className="px-8 py-20 text-center text-slate-400 font-medium">
                          ไม่พบรายชื่อนักศึกษา
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* ================= ส่วนกำหนดวันสอบ ================= */}
          <div className="lg:col-span-1">
            <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100 sticky top-10">
              <h3 className="text-lg font-black text-slate-800 mb-6 flex items-center gap-2">
                <CalendarDaysIcon className="w-6 h-6 text-orange-500" /> กำหนดวันสอบ
              </h3>
              <form action={setFinalExamDate} className="space-y-4">
                <input type="hidden" name="subjectId" value={subject.id} />
                <input type="hidden" name="instructorId" value={uid} />
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                  <label className="block text-[10px] font-black text-slate-400 uppercase mb-2">วันและเวลาสอบ (Final Exam)</label>
                  <input
                    type="datetime-local"
                    name="examDate"
                    defaultValue={defaultExamDate}
                    required
                    className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-[#8A151B]"
                  />
                </div>
                <button type="submit" className="w-full bg-[#8A151B] text-white font-black py-3 rounded-xl text-sm flex items-center justify-center gap-2 hover:bg-slate-900 transition-all">
                  <MegaphoneIcon className="w-4 h-4" /> บันทึกกำหนดการ
                </button>
              </form>

            </div>
          </div>

        </div>
      </div>
    </div>
  )
}