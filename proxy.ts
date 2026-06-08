import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { decrypt } from '@/lib/session';

export async function proxy(request: NextRequest) {
  // 1. ดึงคุกกี้ที่ชื่อว่า session
  const sessionCookie = request.cookies.get('session')?.value;
  
  // 2. ถอดรหัสคุกกี้
  const session = await decrypt(sessionCookie || '');
  const path = request.nextUrl.pathname;

  // 3. รายการหน้าที่ "ต้องล็อกอิน" 
  // ✅ แก้ไข: เปลี่ยนจาก path.startsWith('/projects') เป็นการระบุเจาะจงเฉพาะหน้าที่ต้องห้าม
  const isProtectedRoute = path.startsWith('/admin') || 
                           path.startsWith('/student') || 
                           path.startsWith('/instructor') || 
                           path.startsWith('/lecturer') || 
                           path.startsWith('/head') ||
                           path.startsWith('/projects/create'); // ล็อคแค่หน้าเสนอหัวข้อ/แก้ไข

  // กรณีที่ 1: จะเข้าหน้าที่หวงไว้ แต่ไม่มี Session (ยังไม่ล็อกอิน) -> ไปหน้า /login
  if (isProtectedRoute && !session?.user) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // กรณีที่ 2: ล็อกอินแล้ว "แต่ดันเดินย้อนกลับมาหน้า /login"
  if (path === '/login' && session?.user) {
    const role = session.user.role;
    const uid = session.user.id;
    let targetPath = '/'; // หน้าสำรอง

    if (role === 'STUDENT') targetPath = `/student?uid=${uid}`;
    else if (role === 'ADMIN') targetPath = `/admin?uid=${uid}`;
    else if (role === 'INSTRUCTOR') targetPath = `/instructor?uid=${uid}`;
    else if (role === 'ADVISOR') targetPath = `/lecturer?uid=${uid}`;
    else if (role === 'CHAIR') targetPath = `/head?uid=${uid}`;

    return NextResponse.redirect(new URL(targetPath, request.url));
  }

  return NextResponse.next();
}

// ตั้งค่าให้ Middleware (Proxy) ทำงานทุกหน้า ยกเว้นไฟล์ระบบ
export const config = {
  matcher: ['/((?!api|_next/static|_next/image|images|favicon.ico).*)'],
};