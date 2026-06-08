'use client'

import { logoutAction } from "@/app/login/actions";
import NotificationBell from "@/app/components/NotificationBell";
import Link from "next/link";
import Image from "next/image";
import { updateMeetingStatus, reviewProjectTopic, reviewDocument } from "./actions";
import {
  HomeIcon, UserGroupIcon, ArrowRightOnRectangleIcon,
  CalendarDaysIcon, CheckCircleIcon, XCircleIcon, BellAlertIcon,
  DocumentTextIcon, QueueListIcon, ChatBubbleLeftRightIcon
} from "@heroicons/react/24/outline";

export default function LecturerDashboardView({
  lecturer, uid, currentTab, selectedYear, rawLogs, subjectsWithExams
}: any) {

  const handleLogout = async () => {
    if (confirm("คุณต้องการออกจากระบบใช่หรือไม่?")) {
      try {
        await logoutAction();
        window.location.href = "/";
      } catch (error) {
        window.location.href = "/";
      }
    }
  };

  const getStatusTheme = (status: string) => {
    switch (status) {
      case 'APPROVED': case 'IN_PROGRESS': return { label: "กำลังดำเนินงาน", bg: "bg-emerald-50 text-emerald-600 border-emerald-200" };
      case 'PENDING_APPROVAL': return { label: "รออนุมัติหัวข้อ", bg: "bg-amber-50 text-amber-600 border-amber-200" };
      case 'REJECTED': return { label: "ไม่ผ่าน/ต้องแก้ไข", bg: "bg-rose-50 text-rose-600 border-rose-200" };
      default: return { label: status, bg: "bg-slate-50 text-slate-600 border-slate-200" };
    }
  };

  const formatTeacherName = (u: any) => {
    if (!u) return "ไม่ระบุ";
    const prefix = (u.academicRank || u.phdTitle) ? `${u.academicRank || ""}${u.phdTitle || ""}` : "อ.";
    return `${prefix} ${u.firstName} ${u.lastName}`.trim();
  };

  const allMyProjects = lecturer.advisedProjects.map((ap: any) => ap.project);
  const filteredProjects = allMyProjects.filter((p: any) => selectedYear === 'ALL' || p.academicYear?.toString() === selectedYear);
  const activeProjects = filteredProjects.filter((p: any) => p.status !== 'PENDING_APPROVAL');
  const pendingTopics = filteredProjects.filter((p: any) => p.status === 'PENDING_APPROVAL');

  const pendingMeetings = filteredProjects.flatMap((p: any) =>
    p.meetingLogs.filter((log: any) => log.status === 'PENDING').map((log: any) => ({ ...log, project: p }))
  );

  const pendingDocuments = filteredProjects.flatMap((p: any) =>
    p.documents.filter((doc: any) =>
      doc.status === 'PENDING' ||
      doc.status === 'PENDING_APPROVAL' ||
      doc.status === 'PENDING_ADVISOR'
    ).map((doc: any) => ({ ...doc, project: p }))
  );

  const totalStudents = activeProjects.reduce((sum: number, p: any) => sum + p.members.length, 0);

  const pendingApprovals = [
    ...pendingTopics.map((p: any) => ({
      id: p.id, projectId: p.id, type: 'TOPIC', typeLabel: 'อนุมัติหัวข้อ', badgeColor: 'bg-purple-100 text-purple-700 border-purple-200',
      title: p.titleTh, description: p.titleEn || "ขออนุมัติหัวข้อใหม่", projectCode: p.projectCode || "โครงงานใหม่", members: p.members
    })),
    ...pendingDocuments.map((d: any) => ({
      id: d.id, projectId: d.projectId, type: 'DOCUMENT', fileType: d.fileType, typeLabel: d.fileType.includes('ขอสอบ') ? 'อนุมัติขอสอบ' : 'ตรวจเอกสาร',
      badgeColor: 'bg-blue-100 text-blue-700 border-blue-200', title: `นักศึกษาส่งเอกสาร: ${d.fileType}`, description: `ชื่อไฟล์: ${d.filePath.split('/').pop()}`, projectCode: d.project.projectCode || "ไม่ระบุรหัส", members: d.project.members, fileUrl: d.filePath
    }))
  ];

  const actionHistory = rawLogs.map((log: any) => {
    let actionTitle = "อัปเดตข้อมูลโครงงาน";
    if (log.action === 'APPROVED_TOPIC') actionTitle = "✅ อนุมัติหัวข้อโครงงานแล้ว";
    else if (log.action === 'REJECTED_TOPIC') actionTitle = "❌ ให้แก้ไขหัวข้อโครงงาน";
    else if (log.action === 'APPROVED_MEETING') actionTitle = "✅ บันทึกตรวจสอบการเข้าพบ";
    else if (log.action === 'REJECTED_MEETING') actionTitle = "❌ ปฏิเสธการเข้าพบ";
    else if (log.action === 'APPROVED_DOCUMENT') actionTitle = "✅ ตรวจผ่านเอกสาร / อนุมัติสอบ";
    else if (log.action === 'REJECTED_DOCUMENT') actionTitle = "❌ ให้แก้ไขเอกสาร";
    return { id: log.id, action: log.action, title: actionTitle, projectCode: log.project.projectCode || 'ไม่ระบุรหัส', date: log.createdAt, details: log.details || "ไม่มีรายละเอียด", actor: log.user ? `${log.user.firstName} ${log.user.lastName}` : "ระบบ" };
  });

  const notifications = [
    ...pendingTopics.map((p: any) => ({ id: `topic-${p.id}`, title: "📌 ขออนุมัติหัวข้อใหม่", details: `โครงงาน: ${p.titleTh}`, createdAt: p.createdAt })),
    ...pendingMeetings.map((m: any) => ({ id: `meet-${m.id}`, title: "📅 รอตรวจสอบการเข้าพบ", details: `เรื่อง: ${m.topic}`, createdAt: m.meetDate })),
    ...pendingDocuments.map((d: any) => ({ id: `doc-${d.id}`, title: d.fileType.includes('สอบ') ? "🎓 ยื่นขอสอบ" : "📄 ส่งเอกสารใหม่", details: `เอกสาร: ${d.fileType}`, createdAt: d.uploadedAt }))
  ].sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  subjectsWithExams.forEach((subject: any) => {
    notifications.unshift({
      id: `exam-alert-${subject.id}`, title: "📢 ประกาศกำหนดการสอบไฟนอล",
      details: `วิชา ${subject.subjectCode} สอบวันที่ ${new Date(subject.finalExamDate).toLocaleDateString('th-TH')}`, createdAt: new Date()
    });
  });

  return (
    <div className="flex h-screen bg-[#FDFBFB] font-sans text-slate-800 overflow-hidden">

      {/* ================= SIDEBAR ================= */}
      <aside className="w-64 bg-[#FFFDFC] border-r border-red-50 flex flex-col z-20 shrink-0 shadow-[2px_0_15px_rgba(138,21,27,0.03)] hidden lg:flex">
        <div className="h-24 flex items-center px-6 border-b border-red-50 gap-3">
          <div className="w-11 h-11 bg-white rounded-full flex items-center justify-center shadow-sm overflow-hidden p-0.5 border border-red-100 shrink-0">
            <Image src="/images/en_ksu.png" alt="KSU Logo" width={44} height={44} className="object-contain" priority />
          </div>
          <div>
            <h1 className="font-bold text-[#8A151B] text-sm leading-tight">ระบบจัดการอาจารย์</h1>
            <p className="text-[10px] text-slate-700">ที่ปรึกษา</p>
          </div>
        </div>

        <nav className="flex-1 py-6 space-y-1 overflow-y-auto px-3">
          <p className="text-xs font-bold text-slate-400 px-4 mb-4 uppercase tracking-wider">เมนูหลัก</p>

          <Link href={`?uid=${uid}&tab=overview&year=${selectedYear}`} className={`flex items-center gap-3 px-4 py-3.5 rounded-xl font-bold transition-all relative ${currentTab === 'overview' ? 'bg-red-50 text-[#8A151B]' : 'text-slate-500 hover:text-[#8A151B] hover:bg-red-50/50'}`}>
            {currentTab === 'overview' && <div className="absolute left-0 top-2 bottom-2 w-1 bg-[#8A151B] rounded-r-full"></div>}
            <HomeIcon className="w-5 h-5" /> ภาพรวมและโครงงาน
          </Link>

          <Link href={`?uid=${uid}&tab=approvals&year=${selectedYear}`} className={`flex items-center justify-between px-4 py-3.5 rounded-xl font-bold transition-all relative ${currentTab === 'approvals' ? 'bg-red-50 text-[#8A151B]' : 'text-slate-500 hover:text-[#8A151B] hover:bg-red-50/50'}`}>
            {currentTab === 'approvals' && <div className="absolute left-0 top-2 bottom-2 w-1 bg-[#8A151B] rounded-r-full"></div>}
            <div className="flex items-center gap-3"><BellAlertIcon className="w-5 h-5" /> การอนุมัติ</div>
            {pendingApprovals.length > 0 && <span className="bg-red-100 text-red-600 px-2 rounded-full text-[10px]">{pendingApprovals.length}</span>}
          </Link>

          <Link href={`?uid=${uid}&tab=meetings&year=${selectedYear}`} className={`flex items-center justify-between px-4 py-3.5 rounded-xl font-bold transition-all relative ${currentTab === 'meetings' ? 'bg-red-50 text-[#8A151B]' : 'text-slate-500 hover:text-[#8A151B] hover:bg-red-50/50'}`}>
            {currentTab === 'meetings' && <div className="absolute left-0 top-2 bottom-2 w-1 bg-[#8A151B] rounded-r-full"></div>}
            <div className="flex items-center gap-3"><ChatBubbleLeftRightIcon className="w-5 h-5" /> ตรวจสอบเข้าพบ</div>
            {pendingMeetings.length > 0 && <span className="bg-blue-100 text-blue-600 px-2 rounded-full text-[10px]">{pendingMeetings.length}</span>}
          </Link>

          <Link href={`?uid=${uid}&tab=history&year=${selectedYear}`} className={`flex items-center gap-3 px-4 py-3.5 rounded-xl font-bold transition-all relative ${currentTab === 'history' ? 'bg-red-50 text-[#8A151B]' : 'text-slate-500 hover:text-[#8A151B] hover:bg-red-50/50'}`}>
            {currentTab === 'history' && <div className="absolute left-0 top-2 bottom-2 w-1 bg-[#8A151B] rounded-r-full"></div>}
            <QueueListIcon className="w-5 h-5" /> ประวัติการดำเนินการ
          </Link>
        </nav>

        <div className="p-4">
          <button onClick={handleLogout} className="w-full flex items-center justify-center gap-2 py-3 bg-[#CC1E24] hover:bg-[#A3161A] text-white rounded-xl font-bold transition-all shadow-md shadow-red-200">
            <ArrowRightOnRectangleIcon className="w-5 h-5" /> ออกจากระบบ
          </button>
        </div>
      </aside>

      {/* ================= MAIN CONTENT AREA ================= */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden">

        {/* ✅ Header สีแดง ตามแบบในภาพอ้างอิง */}
        <header className="relative h-24 px-8 flex items-center justify-between bg-gradient-to-r from-[#8A151B] to-[#b71c22] shrink-0 z-50 shadow-md">
          <div className="text-white">
            <h2 className="text-2xl font-black flex items-center gap-2 tracking-tight">
              ยินดีต้อนรับ, {lecturer.firstName}! 👋
            </h2>
            <p className="text-xs text-red-200 mt-1 font-medium tracking-wide">
              ปีการศึกษา {selectedYear === 'ALL' ? 'ทั้งหมด' : selectedYear} • คณะวิศวกรรมศาสตร์และเทคโนโลยีอุตสาหกรรม
            </p>
          </div>

          <div className="flex items-center gap-6">
            {/* ตัวกรองปีการศึกษา */}
            <div className="hidden md:flex gap-1 bg-black/20 backdrop-blur-md p-1 rounded-xl border border-white/10 shadow-inner mr-2">
              {['ALL', '2568', '2567'].map((y) => (
                <Link key={y} href={`?uid=${uid}&tab=${currentTab}&year=${y}`} className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${selectedYear === y ? 'bg-white text-[#8A151B] shadow-sm' : 'text-red-100 hover:bg-white/10'}`}>
                  {y === 'ALL' ? 'ทั้งหมด' : y}
                </Link>
              ))}
            </div>

            {/* กระดิ่งแจ้งเตือน */}
            <div className="bg-white/10 rounded-full flex items-center justify-center hover:bg-white/20 transition-colors">
              <NotificationBell notifications={notifications} />
            </div>

            {/* ข้อมูลโปรไฟล์ */}
            <div className="flex items-center gap-3 pl-6 border-l border-white/20">
              <div className="text-right hidden sm:block text-white">
                <p className="text-sm font-bold">{formatTeacherName(lecturer)}</p>
                <p className="text-[10px] text-red-200 uppercase font-bold tracking-wider">อาจารย์ที่ปรึกษา</p>
              </div>
              <div className="w-10 h-10 rounded-full bg-white text-[#8A151B] flex items-center justify-center font-black border-2 border-red-200 shadow-sm">
                {lecturer.firstName.charAt(0)}
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-6 lg:p-10">

          {/* --- TAB: OVERVIEW --- */}
          {currentTab === 'overview' && (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4">

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white p-6 lg:p-8 rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-md transition-shadow flex items-center gap-6">
                  <div className="h-16 w-16 bg-red-50 text-[#8A151B] rounded-2xl flex items-center justify-center shadow-inner border border-red-100 shrink-0">
                    <DocumentTextIcon className="h-8 w-8" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-700 mb-1 uppercase tracking-wider">โครงงานที่ดูแล</p>
                    <p className="text-4xl font-black text-slate-800">{activeProjects.length} <span className="text-lg font-bold text-slate-700">โครงงาน</span></p>
                  </div>
                </div>
                <div className="bg-white p-6 lg:p-8 rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-md transition-shadow flex items-center gap-6">
                  <div className="h-16 w-16 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center shadow-inner border border-blue-100 shrink-0">
                    <UserGroupIcon className="h-8 w-8" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-700 mb-1 uppercase tracking-wider">นักศึกษาในการดูแล</p>
                    <p className="text-4xl font-black text-slate-800">{totalStudents} <span className="text-lg font-bold text-slate-700">คน</span></p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {activeProjects.map((project: any) => {
                  const theme = getStatusTheme(project.status);
                  return (
                    <div key={project.id} className="bg-white rounded-3xl shadow-sm border border-slate-100 p-6 hover:border-red-200 hover:shadow-lg transition-all group flex flex-col h-full relative overflow-hidden">

                      <div className="absolute top-0 left-0 w-1.5 h-full bg-[#8A151B] opacity-0 group-hover:opacity-100 transition-opacity"></div>

                      <div className="flex justify-between items-start mb-4">
                        <span className="text-[11px] font-black text-slate-500 bg-slate-100 px-3 py-1.5 rounded-lg tracking-widest uppercase border border-slate-200">
                          {project.projectCode || "รอออกรหัส"}
                        </span>
                        <span className={`text-[10px] font-bold px-3 py-1.5 rounded-full border ${theme.bg}`}>
                          {theme.label}
                        </span>
                      </div>

                      <h4 className="font-bold text-lg text-slate-900 mb-2 leading-tight group-hover:text-[#8A151B] transition-colors line-clamp-2">
                        {project.titleTh}
                      </h4>
                      <p className="text-xs text-slate-700 line-clamp-1 mb-6">{project.titleEn}</p>

                      <div className="mt-auto pt-5 border-t border-slate-100 flex justify-between items-center">
                        <div className="flex items-center gap-2">
                          <div className="flex -space-x-2">
                            {project.members.map((m: any) => (
                              <div key={m.id} className="w-8 h-8 rounded-full bg-slate-200 border-2 border-white flex items-center justify-center text-[10px] font-bold text-slate-600 shadow-sm" title={`${m.user.firstName} ${m.user.lastName}`}>
                                {m.user.firstName[0]}
                              </div>
                            ))}
                          </div>
                          <span className="text-xs font-bold text-slate-400 ml-1">{project.members.length} คน</span>
                        </div>

                        <Link href={`/projects/${project.id}?uid=${uid}&role=LECTURER`} className="text-xs font-bold text-[#8A151B] bg-red-50 hover:bg-[#8A151B] hover:text-white px-5 py-2.5 rounded-xl transition-colors border border-red-100">
                          จัดการ
                        </Link>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* --- TAB: APPROVALS --- */}
          {currentTab === 'approvals' && (
            <div className="space-y-4 max-w-4xl animate-in fade-in slide-in-from-bottom-4">
              <h3 className="text-xl font-black text-slate-800 mb-6">คำขอที่รอการอนุมัติ</h3>
              {pendingApprovals.map((item: any, idx: number) => (
                <div key={idx} className={`bg-white rounded-2xl p-6 border-l-4 shadow-sm flex flex-col md:flex-row justify-between gap-6 hover:shadow-md transition-shadow ${item.type === 'TOPIC' ? 'border-l-purple-500' : 'border-l-blue-500'}`}>
                  <div className="flex-1">
                    <span className={`${item.badgeColor} text-[10px] font-bold px-2.5 py-1 rounded-md mb-2 inline-block`}>{item.typeLabel}</span>
                    <h4 className="text-lg font-bold">{item.title}</h4>
                    <p className="text-sm text-slate-500 mt-1">{item.description}</p>
                    <p className="text-xs text-slate-400 mt-3 font-medium">นักศึกษา: {item.members.map((m: any) => m.user.firstName).join(', ')}</p>
                  </div>
                  <div className="flex md:flex-col gap-2 shrink-0">
                    <form action={item.type === 'TOPIC' ? reviewProjectTopic : reviewDocument} className="flex-1">
                      <input type="hidden" name={item.type === 'TOPIC' ? 'projectId' : 'documentId'} value={item.id} />
                      <input type="hidden" name="status" value={item.type === 'TOPIC' ? "PENDING_INSTRUCTOR" : (item.fileType?.includes('ขอสอบ') ? "PENDING_CHAIR" : "APPROVED")} />
                      <input type="hidden" name="lecturerId" value={uid} />
                      <input type="hidden" name="projectId" value={item.projectId} />
                      <input type="hidden" name="fileType" value={item.fileType || "เอกสาร"} />
                      <button className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-2.5 px-6 rounded-xl text-sm shadow-sm flex items-center gap-2 justify-center transition-colors"><CheckCircleIcon className="w-5 h-5" /> อนุมัติ</button>
                    </form>
                    <form action={item.type === 'TOPIC' ? reviewProjectTopic : reviewDocument} className="flex-1">
                      <input type="hidden" name={item.type === 'TOPIC' ? 'projectId' : 'documentId'} value={item.id} />
                      <input type="hidden" name="lecturerId" value={uid} />
                      <input type="hidden" name="status" value="REJECTED" />
                      <input type="hidden" name="projectId" value={item.projectId} />
                      <input type="hidden" name="fileType" value={item.fileType || "เอกสาร"} />
                      <button className="w-full bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-100 font-bold py-2.5 px-6 rounded-xl text-sm flex items-center gap-2 justify-center transition-colors"><XCircleIcon className="w-5 h-5" /> แก้ไข</button>
                    </form>
                  </div>
                </div>
              ))}
              {pendingApprovals.length === 0 && (
                <div className="bg-white p-12 text-center rounded-3xl border border-slate-100"><CheckCircleIcon className="w-16 h-16 text-emerald-400 mx-auto mb-4" /><h4 className="text-lg font-bold text-slate-700">ไม่มีคำขอที่รอดำเนินการ</h4><p className="text-sm text-slate-400">คุณได้พิจารณาอนุมัติคำขอครบทั้งหมดแล้ว</p></div>
              )}
            </div>
          )}

          {/* --- TAB: MEETINGS --- */}
          {currentTab === 'meetings' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-in fade-in slide-in-from-bottom-4">
              <div className="lg:col-span-2 space-y-4">
                <h3 className="text-xl font-black text-slate-800 mb-6">ตรวจสอบการเข้าพบ</h3>
                {pendingMeetings.map((m: any) => {
                  const approvedCount = m.project?.meetingLogs?.filter((log: any) => log.status === 'APPROVED').length || 0;
                  return (
                    <div key={m.id} className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-xs font-bold text-[#8A151B] bg-red-50 px-3 py-1.5 rounded-lg border border-red-100 flex items-center gap-1.5">
                            <CalendarDaysIcon className="w-4 h-4" />
                            {new Date(m.meetDate).toLocaleDateString('th-TH')}
                          </span>
                          <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1.5 rounded-lg border border-emerald-200 flex items-center gap-1">
                            <CheckCircleIcon className="w-3.5 h-3.5" />
                            เข้าพบสำเร็จแล้ว {approvedCount} ครั้ง
                          </span>
                        </div>
                        <span className="text-xs text-slate-400 font-mono bg-slate-50 px-2 py-1 rounded border border-slate-100 shrink-0">
                          {m.project.projectCode || "รอออกรหัส"}
                        </span>
                      </div>

                      <h4 className="font-bold text-lg text-slate-800">{m.topic}</h4>
                      <p className="text-sm text-slate-600 bg-slate-50 p-4 rounded-xl mt-3 italic border border-slate-100">"{m.note || "ไม่มีรายละเอียด"}"</p>

                      <form action={updateMeetingStatus} className="mt-6 pt-5 border-t border-slate-100 flex flex-col sm:flex-row gap-4 items-end">
                        <input type="hidden" name="logId" value={m.id} />
                        <input type="hidden" name="lecturerId" value={uid} />
                        <input type="hidden" name="projectId" value={m.projectId} />

                        <div className="flex-1 w-full">
                          <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1.5 tracking-wider">Feedback อาจารย์</label>
                          <input type="text" name="comment" placeholder="ระบุความเห็นที่นี่ (ถ้ามี)..." className="w-full bg-slate-50 border border-slate-200 focus:border-[#8A151B] focus:ring-1 focus:ring-[#8A151B] outline-none rounded-xl px-4 py-2.5 text-sm transition-all" />
                        </div>
                        <div className="flex gap-2 w-full sm:w-auto shrink-0">
                          <button type="submit" name="status" value="APPROVED" className="flex-1 sm:flex-none bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-2.5 px-6 rounded-xl text-sm shadow-sm transition-colors">ยืนยันการเข้าพบ</button>
                          <button type="submit" name="status" value="REJECTED" className="flex-1 sm:flex-none bg-rose-50 hover:bg-rose-100 text-rose-600 font-bold py-2.5 px-6 rounded-xl text-sm border border-rose-100 transition-colors">ปฏิเสธ</button>
                        </div>
                      </form>
                    </div>
                  );
                })}
                {pendingMeetings.length === 0 && (
                  <div className="bg-white p-12 text-center rounded-3xl border border-slate-100">
                    <CalendarDaysIcon className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                    <h4 className="text-lg font-bold text-slate-700">ไม่มีการเข้าพบที่ต้องตรวจสอบ</h4>
                  </div>
                )}
              </div>

              <div className="space-y-4">
                <h3 className="text-xl font-black text-slate-800 mb-6 flex items-center gap-2">
                  <UserGroupIcon className="w-6 h-6 text-[#8A151B]" /> สรุปการเข้าพบรายกลุ่ม
                </h3>

                <div className="bg-white rounded-[2rem] p-6 border border-slate-100 shadow-sm space-y-4 h-fit max-h-[80vh] overflow-y-auto">
                  {activeProjects.length > 0 ? activeProjects.map((p: any) => {
                    const approvedCount = p.meetingLogs?.filter((log: any) => log.status === 'APPROVED').length || 0;

                    return (
                      <div key={p.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100 hover:border-red-200 transition-colors group">
                        <div className="flex-1 min-w-0 pr-4">
                          <p className="text-[10px] font-black text-slate-500 bg-white px-2 py-0.5 rounded-md border border-slate-200 inline-block mb-1.5 group-hover:text-[#8A151B] transition-colors">
                            {p.projectCode || 'รอออกรหัส'}
                          </p>
                          <p className="text-sm font-bold text-slate-800 truncate">{p.titleTh}</p>
                          <p className="text-[10px] text-slate-700 mt-1 truncate">
                            {p.members.map((m: any) => m.user.firstName).join(', ')}
                          </p>
                        </div>

                        <div className="text-center shrink-0 bg-white px-3 py-2 rounded-xl border border-slate-100 min-w-[3.5rem] shadow-sm">
                          <p className="text-2xl font-black text-emerald-600 leading-none">{approvedCount}</p>
                          <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1">ครั้ง</p>
                        </div>
                      </div>
                    );
                  }) : (
                    <div className="text-center py-8 text-sm text-slate-400 italic">
                      ยังไม่มีโครงงานที่ดูแลในขณะนี้
                    </div>
                  )}
                </div>
              </div>

            </div>
          )}

          {/* --- TAB: HISTORY --- */}
          {currentTab === 'history' && (
            <div className="max-w-4xl animate-in fade-in slide-in-from-bottom-4">
              <h3 className="text-xl font-black text-slate-800 mb-6">ประวัติการดำเนินการล่าสุด</h3>
              <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm relative space-y-8 before:absolute before:inset-0 before:ml-12 before:h-full before:w-0.5 before:bg-slate-100">
                {actionHistory.length > 0 ? actionHistory.map((log: any) => (
                  <div key={log.id} className="relative pl-16 flex flex-col gap-1">
                    <div className={`absolute left-10 top-0 w-4 h-4 rounded-full border-4 border-white z-10 shadow-sm ${log.action.includes('APPROVED') ? 'bg-emerald-500' : 'bg-rose-500'}`}></div>
                    <div className="flex items-center justify-between"><h4 className="font-bold text-sm text-slate-800">{log.title}</h4><span className="text-[10px] font-bold text-slate-400 bg-slate-50 px-2 py-1 rounded-md">{new Date(log.date).toLocaleString('th-TH')}</span></div>
                    <p className="text-xs text-slate-600 bg-slate-50 border border-slate-100 p-3 rounded-xl mt-2 leading-relaxed">{log.details}</p>
                  </div>
                )) : (
                  <div className="pl-16 text-center py-8"><p className="text-sm text-slate-400">ยังไม่มีประวัติการทำรายการ</p></div>
                )}
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}