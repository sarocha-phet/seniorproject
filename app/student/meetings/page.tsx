import { prisma } from "@/lib/prisma";
import Link from "next/link";
import MeetingView from "./MeetingView";

export default async function MeetingPage({
  searchParams,
}: {
  searchParams: { uid?: string };
}) {
  const resolvedParams = await searchParams;
  const uid = resolvedParams.uid;
  
  // 1. ดักจับกรณีไม่มี uid
  if (!uid) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex flex-col items-center justify-center p-6 text-center">
        <h1 className="text-2xl font-bold text-slate-900 mb-2">ไม่พบข้อมูลการเข้าสู่ระบบ</h1>
        <p className="text-slate-500 mb-6">กรุณาเข้าสู่ระบบใหม่อีกครั้ง</p>
        <Link href="/login" className="bg-[#8A151B] text-white px-6 py-3 rounded-xl font-bold hover:bg-slate-900 transition shadow-md">
          ไปหน้าเข้าสู่ระบบ
        </Link>
      </div>
    );
  }

  // 2. ดึงข้อมูล User และ Project
  const user = await prisma.user.findUnique({
    where: { id: uid },
    include: {
      projects: {
        include: {
          project: {
            include: {
              meetingLogs: {
                orderBy: { meetDate: 'desc' }
              },
              advisors: { include: { user: true } }
            }
          }
        }
      }
    }
  });

  if (!user) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex flex-col items-center justify-center p-6 text-center">
        <h1 className="text-2xl font-bold text-slate-900 mb-2">ไม่พบผู้ใช้งาน</h1>
        <Link href="/login" className="text-red-600 underline font-bold">กลับไปหน้าเข้าสู่ระบบ</Link>
      </div>
    );
  }

  const activeProject = user.projects.map(p => p.project).sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())[0];

  // คำนวณสถิติ
  const totalMeetings = activeProject?.meetingLogs.length || 0;
  const targetMeetings = 12;
  const progress = Math.min((totalMeetings / targetMeetings) * 100, 100);
  const remaining = Math.max(0, targetMeetings - totalMeetings);

  // 3. ส่งข้อมูลทั้งหมดไปให้ Client Component แสดงผล
  return (
    <MeetingView 
      uid={uid}
      user={user}
      activeProject={activeProject}
      totalMeetings={totalMeetings}
      targetMeetings={targetMeetings}
      progress={progress}
      remaining={remaining}
    />
  );
}