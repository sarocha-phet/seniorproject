import { jwtVerify, SignJWT } from "jose";
import { cookies } from "next/headers";

// คีย์สำหรับเข้ารหัส (ดึงจาก .env.local)
const secretKey = process.env.SESSION_SECRET || "ksu-super-secret-key-rms-2024";
const encodedKey = new TextEncoder().encode(secretKey);

// 1. ฟังก์ชันเข้ารหัส JWT
export async function encrypt(payload: any) {
  return await new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("1d") // ตั้งให้อายุคุกกี้อยู่ได้ 1 วัน
    .sign(encodedKey);
}

// 2. ฟังก์ชันถอดรหัส JWT
export async function decrypt(input: string): Promise<any> {
  try {
    const { payload } = await jwtVerify(input, encodedKey, { algorithms: ["HS256"] });
    return payload;
  } catch (error) {
    return null;
  }
}

// 3. สร้าง Session (บันทึกลง HttpOnly Cookie)
export async function createSession(userId: string, username: string, role: string) {
  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 1 วัน
  
  // สร้าง Token โดยเก็บข้อมูล user ลงไป
  const sessionToken = await encrypt({ 
    user: { id: userId, username, role }, 
    expiresAt 
  });

  // ฝังลง Cookie
  const cookieStore = await cookies();
  cookieStore.set("session", sessionToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    expires: expiresAt,
  });
}

// 4. ลบ Session (ออกจากระบบ)
export async function deleteSession() {
  const cookieStore = await cookies();
  cookieStore.delete("session");
}