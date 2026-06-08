'use server'

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

// ==========================================
// 1. ฟังก์ชันอนุมัติ/ปฏิเสธ "เอกสารและการขอสอบ"
// ==========================================
export async function reviewDocument(formData: FormData) {
  const documentId = formData.get('documentId') as string;
  const status = formData.get('status') as any; // ✅ แก้ไข: เติม as any เพื่อแก้ Error Typescript

  try {
    // อัปเดตสถานะของเอกสาร (รวมถึงเอกสารขอสอบ)
    await prisma.document.update({
      where: { id: documentId },
      data: { status: status }
    });

    // 🔄 รีเฟรชข้อมูลในหน้าต่างๆ เพื่อให้ UI อัปเดตทันที
    revalidatePath('/lecturer');
    revalidatePath('/head');
    revalidatePath('/student/documents');
    revalidatePath('/student/exam-request');
    
    return { success: true };
  } catch (error) {
    console.error("Error updating document:", error);
    return { success: false, error: "เกิดข้อผิดพลาดในการอัปเดตเอกสาร" };
  }
}

// ==========================================
// 2. ฟังก์ชันอนุมัติ/ปฏิเสธ "หัวข้อโครงงาน"
// ==========================================
export async function reviewProjectTopic(formData: FormData) {
  const projectId = formData.get('projectId') as string;
  const status = formData.get('status') as any; // ✅ แก้ไข: เติม as any

  try {
    // อัปเดตสถานะของโครงงาน
    await prisma.project.update({
      where: { id: projectId },
      data: { status: status }
    });

    revalidatePath('/lecturer');
    revalidatePath('/head');
    revalidatePath('/projects');
    
    return { success: true };
  } catch (error) {
    console.error("Error updating project topic:", error);
    return { success: false, error: "เกิดข้อผิดพลาดในการอัปเดตสถานะโครงงาน" };
  }
}

// ==========================================
// 3. ฟังก์ชันตรวจสอบ/ยืนยัน "บันทึกการเข้าพบ (Meeting)"
// ==========================================
export async function updateMeetingStatus(formData: FormData) {
  const logId = formData.get('logId') as string;
  const status = formData.get('status') as any; // ✅ แก้ไข: เติม as any
  const comment = formData.get('comment') as string; // คำแนะนำ/Feedback จากอาจารย์

  try {
    // ดึงข้อมูลเดิมมาก่อน เผื่อเอา note เดิมมาต่อกับ comment ใหม่ (ปรับตาม Schema ของคุณได้)
    const existingLog = await prisma.meetingLog.findUnique({
      where: { id: logId }
    });

    // หากมีการส่ง Comment มา ให้เอาไปต่อท้ายรายละเอียดเดิม (หรือจะแยกคอลัมน์ feedback ก็ได้)
    let newNote = existingLog?.note || "";
    if (comment && comment.trim() !== "") {
      newNote = `${newNote}\n\n[Feedback อาจารย์]: ${comment}`;
    }

    await prisma.meetingLog.update({
      where: { id: logId },
      data: { 
        status: status,
        note: newNote
      }
    });

    revalidatePath('/lecturer');
    revalidatePath('/student/meetings');
    
    return { success: true };
  } catch (error) {
    console.error("Error updating meeting log:", error);
    return { success: false, error: "เกิดข้อผิดพลาดในการตรวจสอบการเข้าพบ" };
  }
}