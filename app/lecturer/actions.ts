'use server'

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

// ===================================================================
// ฟังก์ชันสำหรับ อัปเดตสถานะการเข้าพบ (หน้า Dashboard อาจารย์ที่ปรึกษา)
// ===================================================================
export async function updateMeetingStatus(formData: FormData) {
  const logId = formData.get('logId') as string;
  const status = formData.get('status') as string; 
  const lecturerId = formData.get('lecturerId') as string; 
  const projectId = formData.get('projectId') as string;
  const comment = formData.get('comment') as string; // ✅ รับค่าคอมเมนต์จากฟอร์ม

  if (!logId || !status) {
    console.error("ไม่พบ logId หรือ status");
    return;
  }

  try {
    // 1. อัปเดตสถานะในฐานข้อมูล
    await prisma.meetingLog.update({
      where: { id: logId },
      data: { 
        status: status,
        // ⚠️ หมายเหตุ: ถ้าใน schema.prisma ของคุณตาราง MeetingLog มีฟิลด์สำหรับเก็บความเห็น
        // ให้เอาคอมเมนต์ (//) บรรทัดด้านล่างออก และแก้ชื่อฟิลด์ให้ตรงกับ DB ของคุณ (เช่น feedback, comment)
        // comment: comment || null 
      }
    });

    // 2. บันทึกประวัติลงตาราง ProjectLog พร้อมแนบคอมเมนต์ (ให้แสดงในหน้า History)
    if (lecturerId && projectId) {
      const detailBase = status === 'APPROVED' ? "ยืนยันการเข้าพบของนักศึกษา" : "ปฏิเสธการเข้าพบของนักศึกษา";
      const finalDetail = comment ? `${detailBase} (ความเห็น: ${comment})` : detailBase;

      await prisma.projectLog.create({
        data: {
          projectId: projectId,
          userId: lecturerId,
          action: status === 'APPROVED' ? "APPROVED_MEETING" : "REJECTED_MEETING",
          details: finalDetail 
        }
      });
    }

  } catch (error) {
    console.error("เกิดข้อผิดพลาดในการอัปเดตสถานะการเข้าพบ:", error);
    return;
  }

  revalidatePath('/lecturer'); 
}
// ===================================================================
// ฟังก์ชันสำหรับ อนุมัติ/ให้แก้ไข หัวข้อโครงงาน (หน้า Dashboard อาจารย์ที่ปรึกษา)
// ===================================================================
export async function reviewProjectTopic(formData: FormData) {
  const projectId = formData.get("projectId") as string;
  const lecturerId = formData.get("lecturerId") as string;
  // ✅ 1. แก้ตรงนี้ ให้รับค่าเป็น string ธรรมดาแทนที่จะล็อคแค่ APPROVED | REJECTED
  const status = formData.get("status") as string;

  if (!projectId || !status) {
    console.error("ข้อมูลไม่ครบถ้วน");
    return;
  }

  try {
    // 1. อัปเดตสถานะโครงงาน (ตอนนี้สถานะจะเป็น PENDING_INSTRUCTOR ตามที่ส่งมา)
    await prisma.project.update({
      where: { id: projectId },
      data: { status: status as any } // ใส่ as any กันเหนียว
    });

    // 2. บันทึกประวัติลง ProjectLog
    if (lecturerId) {
      await prisma.projectLog.create({
        data: {
          projectId: projectId,
          userId: lecturerId,
          // ✅ 2. แก้เงื่อนไข Log ให้เช็คจาก PENDING_INSTRUCTOR แทน
          action: status === "PENDING_INSTRUCTOR" ? "APPROVED_TOPIC" : "REJECTED_TOPIC",
          details: status === "PENDING_INSTRUCTOR" ? "ที่ปรึกษาอนุมัติหัวข้อโครงงาน (ส่งต่อให้ประจำวิชา)" : "ให้แก้ไขหัวข้อโครงงาน"
        }
      });
    }

  } catch (error) {
    console.error("Review Error:", error);
    return;
  }

  // 3. รีเฟรชหน้าแคชของหน้าอาจารย์ที่ปรึกษา
  revalidatePath('/lecturer');
}

export async function reviewDocument(formData: FormData) {
  const documentId = formData.get("documentId") as string;
  const lecturerId = formData.get("lecturerId") as string;
  const projectId = formData.get("projectId") as string;
  const fileType = formData.get("fileType") as string || "เอกสาร";
  // ✅ 1. เปลี่ยนการรับค่า status ให้เป็น string ธรรมดา เพื่อให้รับค่าได้หลากหลายขึ้น
  const status = formData.get("status") as string; 

  if (!documentId || !status) {
    console.error("ข้อมูลไม่ครบถ้วน");
    return;
  }

  try {
    // 1. อัปเดตสถานะเอกสารในตาราง Document
    await prisma.document.update({
      where: { id: documentId },
      data: { status: status as any } 
    });

    // ==========================================
    // ✅ 2. เพิ่มส่วนนี้เข้าไป: ถ้าไฟล์ที่ตรวจคือ Chapter ให้อัปเดตตาราง ProjectChapter ด้วย
    // ==========================================
    if (fileType.startsWith("Chapter") && projectId) {
      const chapterNum = parseInt(fileType.replace("Chapter ", ""));
      
      const existingChapter = await prisma.projectChapter.findFirst({
        where: { projectId: projectId, chapterNumber: chapterNum }
      });

      if (existingChapter) {
        await prisma.projectChapter.update({
          where: { id: existingChapter.id },
          data: { status: status as any } // อัปเดตให้เป็น APPROVED หรือ REJECTED ตามเอกสาร
        });
      }
    }
    // ==========================================

    // 3. บันทึกประวัติลง ProjectLog
    if (lecturerId && projectId) {
      let actionStr = "APPROVED_DOCUMENT";
      let detailStr = `อนุมัติเอกสาร: ${fileType}`;
      
      if (status === 'REJECTED') {
        actionStr = "REJECTED_DOCUMENT";
        detailStr = `ให้แก้ไขเอกสาร: ${fileType}`;
      } else if (status === 'PENDING_CHAIR') {
        actionStr = "FORWARDED_TO_CHAIR";
        detailStr = `เห็นชอบคำขอสอบและส่งเรื่องต่อให้ประธานหลักสูตร (${fileType})`;
      }

      await prisma.projectLog.create({
        data: {
          projectId: projectId,
          userId: lecturerId,
          action: actionStr,
          details: detailStr
        }
      });
    }

  } catch (error) {
    console.error("Review Document Error:", error);
    return;
  }

  // 4. รีเฟรชหน้า
  revalidatePath('/lecturer');
}