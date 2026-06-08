'use server'

import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"

export async function createMeetingLog(formData: FormData) {
  // 1. รับค่าต่างๆ ที่ส่งมาจากฟอร์ม
  const projectId = formData.get('projectId') as string
  const topic = formData.get('topic') as string
  const note = formData.get('note') as string
  const dateStr = formData.get('meetDate') as string
  
  // ดักจับกรณีไม่มี ID โครงงาน
  if (!projectId) {
    console.error("Missing projectId");
    return;
  }

  try {
    // 2. บันทึกข้อมูลลง Database
    await prisma.meetingLog.create({
      data: {
        projectId: projectId,
        topic: topic,
        note: note || "", // ถ้าไม่ได้กรอกรายละเอียดมา ให้เป็นค่าว่าง
        meetDate: new Date(dateStr), // แปลง String วันที่ เป็นรูปแบบ DateTime
        status: "PENDING" // ตั้งสถานะเริ่มต้นเป็น "รอการยืนยัน" (ให้อาจารย์มากดยืนยันอีกที)
      }
    });
  } catch (error) {
    console.error("Create Meeting Log Error:", error);
    return;
  }

  // 3. รีเฟรชหน้าเว็บ (Clear Cache) เพื่อให้ข้อมูลการเข้าพบใหม่แสดงขึ้นมาทันที
  revalidatePath('/student/meetings')
}