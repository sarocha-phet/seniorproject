import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";
import { revalidatePath } from "next/cache";
import { 
  ChevronLeftIcon,
  UserGroupIcon,
  MagnifyingGlassIcon,
  ShieldCheckIcon,
  AcademicCapIcon,
  UserIcon,
  XMarkIcon
} from "@heroicons/react/24/outline";
import ConfirmRoleButton from "./ConfirmRoleButton";

// ✅ Server Action สำหรับเปลี่ยนสิทธิ์ผู้ใช้งาน
async function changeUserRole(formData: FormData) {
  'use server'
  const targetUserId = formData.get('userId') as string;
  const newRoleId = formData.get('roleId') as string;

  if (!targetUserId || !newRoleId) return;

  try {
    await prisma.user.update({
      where: { id: targetUserId },
      data: {
        roles: {
          set: [{ id: newRoleId }]
        }
      }
    });
    revalidatePath('/admin/users');
  } catch (error) {
    console.error("Error updating role:", error);
  }
}

export default async function AdminUsersPage({ 
  searchParams 
}: { 
  searchParams: { uid?: string; q?: string; role?: string } 
}) {
  const resolvedParams = await searchParams;
  const uid = resolvedParams.uid;
  const query = resolvedParams.q || "";
  const roleFilter = resolvedParams.role || "";

  if (!uid) redirect('/login');

  // 1. ตรวจสอบสิทธิ์ Admin
  const admin = await prisma.user.findUnique({
    where: { id: uid },
    include: { roles: true }
  });
  const isAdmin = admin?.roles?.some((r) => r.name === 'ADMIN');
  if (!admin || !isAdmin) redirect('/login');

  // 2. ดึงข้อมูล Role ทั้งหมด
  const allRoles = await prisma.role.findMany({
    orderBy: { name: 'asc' }
  });

  // 3. ดึงข้อมูลผู้ใช้งานตามคำค้นหา
  const users = await prisma.user.findMany({
    where: {
      AND: [
        {
          OR: [
            { firstName: { contains: query } },
            { lastName: { contains: query } },
            { username: { contains: query } },
          ]
        },
        roleFilter ? { roles: { some: { name: roleFilter } } } : {}
      ]
    },
    include: { roles: true },
    orderBy: { createdAt: 'desc' }
  });

  return (
    // ✅ 1. เปลี่ยนพื้นหลังเป็น bg-slate-50
    <div className="min-h-screen bg-slate-50 py-10 px-4 font-sans text-slate-950 overflow-x-hidden">
      <div className="w-full max-w-[1200px] mx-auto space-y-8">
        
        {/* --- Header --- */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="min-w-0 flex-1">
            <Link href={`/admin?uid=${uid}`} className="inline-flex items-center gap-2 text-slate-500 hover:text-[#8A151B] transition-colors text-sm font-black mb-4 bg-white px-4 py-2 rounded-full shadow-sm border border-slate-200 w-fit">
              <ChevronLeftIcon className="w-4 h-4" /> กลับไปหน้าแผงควบคุม
            </Link>
            <h1 className="text-3xl font-black text-[#4A151B] flex items-center gap-3 truncate mt-2">
              <UserGroupIcon className="w-10 h-10 text-[#8A151B] shrink-0" />
              จัดการผู้ใช้งานทั้งหมด
            </h1>
            <p className="text-slate-600 mt-2 font-bold">ตรวจสอบ ค้นหา และปรับเปลี่ยนสิทธิ์ (Role) ของผู้ใช้งานในระบบ</p>
          </div>
        </div>

        {/* --- Search & Filter Bar --- */}
        <div className="bg-white p-5 rounded-[2.5rem] shadow-sm border border-slate-200 flex flex-col lg:flex-row gap-4">
          <div className="flex-1 relative">
            <MagnifyingGlassIcon className="w-5 h-5 absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            <form action="" method="GET" className="w-full">
                <input type="hidden" name="uid" value={uid} />
                <input type="hidden" name="role" value={roleFilter} />
                <input 
                  type="text" 
                  name="q"
                  defaultValue={query}
                  placeholder="ค้นหาชื่อ หรือ รหัสนักศึกษา..." 
                  className="w-full pl-14 pr-12 py-4 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-[#8A151B] focus:border-transparent transition-all text-sm font-black text-slate-950"
                />
                
                {query && (
                  <Link 
                    href={`/admin/users?uid=${uid}&role=${roleFilter}`}
                    className="absolute right-4 top-1/2 -translate-y-1/2 p-1.5 bg-slate-200 hover:bg-rose-100 hover:text-rose-600 rounded-full transition-colors text-slate-500"
                    title="ล้างการค้นหา"
                  >
                    <XMarkIcon className="w-4 h-4" />
                  </Link>
                )}
            </form>
          </div>
          
          <div className="flex gap-2 overflow-x-auto pb-2 lg:pb-0 shrink-0 items-center scrollbar-hide">
            <Link
              href={`/admin/users?uid=${uid}&q=${query}`}
              className={`px-5 py-3.5 rounded-2xl text-xs font-black transition-all whitespace-nowrap border ${
                roleFilter === '' 
                ? 'bg-[#8A151B] text-white border-[#8A151B] shadow-md' 
                : 'bg-white text-slate-500 border-slate-200 hover:border-[#8A151B] hover:text-[#8A151B]'
              }`}
            >
              ผู้ใช้ทั้งหมด
            </Link>
            {allRoles.map((r) => (
              <Link
                key={r.id}
                href={`/admin/users?uid=${uid}&role=${r.name}&q=${query}`}
                className={`px-5 py-3.5 rounded-2xl text-xs font-black transition-all whitespace-nowrap border uppercase ${
                  roleFilter === r.name 
                  ? 'bg-[#8A151B] text-white border-[#8A151B] shadow-md' 
                  : 'bg-white text-slate-500 border-slate-200 hover:border-[#8A151B] hover:text-[#8A151B]'
                }`}
              >
                {r.name}
              </Link>
            ))}
          </div>
        </div>

        {/* --- Users Table --- */}
        {/* ✅ 2. เพิ่มแถบสีแดงด้านบนตาราง และเพิ่มเงา shadow-md */}
        <div className="bg-white rounded-[2.5rem] shadow-md border border-slate-200 overflow-hidden border-t-[8px] border-t-[#8A151B]">
          <div className="overflow-x-auto">
            <table className="w-full text-left table-fixed min-w-[900px]">
              <thead>
                {/* ✅ 3. ปรับสีหัวตารางเป็นแดงอ่อนๆ ให้แบ่งสัดส่วนชัดเจน */}
                <tr className="bg-red-50/80 border-b border-red-100 uppercase tracking-widest text-[11px] font-black text-[#8A151B]">
                  <th className="px-8 py-5 w-2/5">ข้อมูลผู้ใช้งาน</th>
                  <th className="px-8 py-5 w-1/4">สิทธิ์ปัจจุบัน (Role)</th>
                  <th className="px-8 py-5 text-right">ปรับเปลี่ยนสิทธิ์</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {users.map((user) => {
                  const currentRole = user.roles[0]?.name || 'NO_ROLE';
                  
                  return (
                    // ✅ 4. เปลี่ยน Hover เป็นสีแดงอ่อนๆ
                    <tr key={user.id} className="hover:bg-red-50/40 transition-colors group">
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-5">
                          <div className="w-12 h-12 bg-white text-[#8A151B] rounded-2xl flex items-center justify-center shrink-0 border border-red-100 shadow-sm group-hover:bg-[#8A151B] group-hover:text-white transition-colors">
                            {currentRole === 'ADMIN' ? <ShieldCheckIcon className="w-6 h-6" /> : 
                             currentRole === 'STUDENT' ? <UserIcon className="w-6 h-6" /> : 
                             <AcademicCapIcon className="w-6 h-6" />}
                          </div>
                          <div className="min-w-0">
                            <p className="font-black text-slate-900 text-base truncate group-hover:text-[#8A151B] transition-colors">
                              {user.titlePrefix || ''} {user.firstName} {user.lastName}
                            </p>
                            <p className="text-xs font-bold text-slate-500 truncate mt-1 font-mono uppercase tracking-wider">
                              ID: <span className="text-[#8A151B]">{user.username}</span> {user.department ? `| ${user.department}` : ''}
                            </p>
                          </div>
                        </div>
                      </td>
                      
                      <td className="px-8 py-6">
                        <div className="flex flex-wrap gap-2">
                          {user.roles.length > 0 ? (
                            user.roles.map((r) => (
                              <span key={r.id} className={`px-3 py-1.5 rounded-lg text-[10px] font-black border uppercase tracking-widest shadow-sm ${
                                r.name === 'ADMIN' ? 'bg-purple-50 text-purple-700 border-purple-200' :
                                r.name === 'STUDENT' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                                'bg-emerald-50 text-emerald-700 border-emerald-200'
                              }`}>
                                {r.name}
                              </span>
                            ))
                          ) : (
                            <span className="text-xs font-bold text-slate-400 italic bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-200">ไม่มีสิทธิ์</span>
                          )}
                        </div>
                      </td>
                      
                      <td className="px-8 py-6">
                       <form action={changeUserRole} className="flex justify-end gap-2 items-center">
                          <input type="hidden" name="userId" value={user.id} />
                          <select 
                            name="roleId" 
                            className="bg-white border border-slate-200 hover:border-red-300 text-slate-900 text-xs font-bold rounded-xl focus:ring-[#8A151B] focus:border-[#8A151B] block p-2.5 outline-none cursor-pointer uppercase shadow-sm transition-all"
                            defaultValue={user.roles[0]?.id || ""}
                          >
                            <option value="" disabled>เลือกสิทธิ์ใหม่</option>
                            {allRoles.map((r) => (
                              <option key={r.id} value={r.id}>{r.name}</option>
                            ))}
                          </select>
                          <ConfirmRoleButton />
                        </form>
                      </td>
                    </tr>
                  );
                })}

                {users.length === 0 && (
                  <tr>
                    <td colSpan={3} className="px-8 py-24 text-center bg-white">
                       <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-slate-100">
                         <UserGroupIcon className="w-10 h-10 text-slate-300" />
                       </div>
                       <p className="text-slate-500 font-bold text-lg">ไม่พบข้อมูลผู้ใช้งานที่ค้นหา</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
}