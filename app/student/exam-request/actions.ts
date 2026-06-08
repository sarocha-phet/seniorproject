'use server'

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function submitExamRequest(projectId: string, studentId: string) {
  try {
    // 1. ตรวจสอบว่าเคยยื่นไปแล้วหรือยัง
    const existingRequest = await prisma.document.findFirst({
      where: {
        projectId: projectId,
        fileType: "ยื่นขอสอบโครงงาน"
      }
    });

    if (existingRequest) {
      return { success: false, error: "คุณได้ยื่นคำขอสอบไปแล้ว" };
    }

    // 2. สร้างคำขอสอบ (เก็บในรูปแบบ Document แต่ตั้ง Status พิเศษ)
    // 💡 หัวใจสำคัญของการแจ้งเตือนอยู่ที่นี่! 
    // เราตั้งสถานะเริ่มต้นเป็น 'PENDING_ADVISOR' เพื่อให้อาจารย์ที่ปรึกษาเห็นก่อน
    await prisma.document.create({
      data: {
        projectId: projectId,
        uploaderId: studentId,
        fileType: "ยื่นขอสอบโครงงาน",
        filePath: "system-generated-request", 
        status: "PENDING_ADVISOR" // ส่งให้ที่ปรึกษา
      }
    });

    // รีเฟรชหน้าเว็บเพื่อให้ UI เปลี่ยน
    revalidatePath('/student/exam-request');
    revalidatePath('/student');

    return { success: true };
  } catch (error) {
    console.error("Submit Exam Error:", error);
    return { success: false, error: "ระบบขัดข้อง" };
  }
}