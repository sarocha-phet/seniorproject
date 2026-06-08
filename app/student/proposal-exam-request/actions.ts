'use server'

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function submitProposalExamRequest(projectId: string, studentId: string) {
  try {
    // 1. ตรวจสอบว่าเคยยื่นขอสอบเค้าโครงไปแล้วหรือยัง
    const existingRequest = await prisma.document.findFirst({
      where: {
        projectId: projectId,
        fileType: "ยื่นขอสอบเค้าโครง" // ✅ ใช้ชื่อให้ต่างจากการสอบจบ
      }
    });

    if (existingRequest) {
      return { success: false, error: "คุณได้ยื่นคำขอสอบเค้าโครงไปแล้ว" };
    }

    // 2. สร้างคำขอสอบเค้าโครง
    await prisma.document.create({
      data: {
        projectId: projectId,
        uploaderId: studentId,
        fileType: "ยื่นขอสอบเค้าโครง",
        filePath: "system-generated-proposal-request", 
        status: "PENDING_ADVISOR" // ส่งให้ที่ปรึกษาพิจารณาก่อน
      }
    });

    revalidatePath('/student/proposal-exam-request');
    revalidatePath('/student');

    return { success: true };
  } catch (error) {
    console.error("Submit Proposal Exam Error:", error);
    return { success: false, error: "ระบบขัดข้อง" };
  }
}