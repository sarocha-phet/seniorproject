'use server'

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

// ===================================================================
// ฟังก์ชันสำหรับ "อาจารย์ประจำวิชา" กดอนุมัติหัวข้อ 
// ===================================================================
export async function approveByInstructor(formData: FormData) {
  const projectId = formData.get("projectId") as string;
  const instructorId = formData.get("instructorId") as string;

  if (!projectId || !instructorId) {
    console.error("ข้อมูลไม่ครบถ้วน");
    return;
  }

  try {
    // 1. อัปเดตสถานะโครงงานเป็น "รอประธานหลักสูตรอนุมัติ"
    await prisma.project.update({
      where: { id: projectId },
      data: { 
        status: "PENDING_APPROVAL" as any // ✅ เปลี่ยนตรงนี้เพื่อส่งต่อให้ประธานหลักสูตร
      }
    });

    // 2. บันทึกประวัติลง ProjectLog (สีเขียว ✅)
    await prisma.projectLog.create({
      data: {
        projectId: projectId,
        userId: instructorId,
        action: "APPROVED_TOPIC", 
        details: "อาจารย์ประจำวิชาอนุมัติหัวข้อโครงงานแล้ว (รอประธานหลักสูตรพิจารณาขั้นสุดท้าย)" // ✅ แก้ไขข้อความประวัติให้ตรงกับสถานะ
      }
    });

  } catch (error) {
    console.error("Instructor Approve Error:", error);
    return;
  }

  // 3. รีเฟรชหน้าแคช
  revalidatePath('/instructor');
  revalidatePath('/head'); // ✅ เพิ่มการรีเฟรชหน้าประธานหลักสูตรด้วย
}