'use server'

import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { createSession, deleteSession } from "@/lib/session"; 
// ✅ 1. เพิ่ม revalidatePath เพื่อล้างแคชของระบบ
import { revalidatePath } from "next/cache";

const loginSchema = z.object({
  username: z.string().min(1, { message: "กรุณากรอกชื่อผู้ใช้งาน" }),
  password: z.string().min(1, { message: "กรุณากรอกรหัสผ่าน" }),
  role: z.enum(['STUDENT', 'ADVISOR', 'INSTRUCTOR', 'CHAIR', 'ADMIN'], { 
    message: "ระบุบทบาทไม่ถูกต้อง" 
  }),
});

export async function loginWithUsername(username: string, password: string, role: string) {
  
  const validatedFields = loginSchema.safeParse({ username, password, role });

  if (!validatedFields.success) {
    return { error: validatedFields.error.issues[0]?.message };
  }

  //  try {
  //   const ldapResponse = await fetch(process.env.LDAP_API_URL!, {
  //     method: 'POST', 
  //     headers: {
  //       'Content-Type': 'application/json',
  //       'Authorization': `Bearer ${process.env.LDAP_API_KEY}` 
  //     },
  //     body: JSON.stringify({ username, password })
  //   });

  //   if (!ldapResponse.ok) return { error: "ชื่อผู้ใช้งานหรือรหัสผ่านไม่ถูกต้อง (LDAP)" };
  // } catch (error) {
  //   return { error: "ไม่สามารถเชื่อมต่อระบบยืนยันตัวตนมหาลัยได้" };
  // }
  

  // ============================================================
  // ฐานข้อมูลระบบ RMS
  // ============================================================
  
  const user = await prisma.user.findUnique({
    where: { username },
    include: { roles: true }
  });

  if (!user) {
    return { error: "ไม่พบบัญชีนี้ในระบบจัดการโครงงาน (RMS)" }; 
  }

  const userRoleNames = user.roles.map(r => r.name);
  if (!userRoleNames.includes(role)) {
    return { error: "บัญชีนี้ไม่มีสิทธิ์เข้าใช้งานในบทบาทที่คุณเลือก" };
  }

  // ✅ 2. สร้าง Session (JWT Cookie)
  await createSession(user.id, user.username, role);

  // ✅ 3. สั่ง Revalidate หน้า Login เพื่อล้าง Error เก่าๆ (ถ้ามี)
  revalidatePath('/login');

  return { 
    success: true, 
    user: { 
      id: user.id, 
      username: user.username, 
      firstName: user.firstName, 
      lastName: user.lastName, 
      role: role 
    }
  };
}

// ============================================================
// 🚪 ฟังก์ชันออกจากระบบ (Logout)
// ============================================================
// ในไฟล์ actions.ts ต้องมี export แบบนี้
export async function logoutAction() {
  await deleteSession();
  return { success: true };

  
  // 2. ✅ ล้างแคชของหน้าเว็บทั้งหมด เพื่อให้ยาม (Middleware) ตรวจบัตรใหม่ทันที
  revalidatePath('/', 'layout'); 
  
  return { success: true };
}
