'use server'

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

// ==========================================
// 1. ฟังก์ชันสร้างรายวิชาใหม่
// ==========================================
export async function createSubject(formData: FormData) {
  const subjectCode = formData.get("subjectCode") as string;
  const nameTh = formData.get("nameTh") as string;
  const nameEn = formData.get("nameEn") as string;
  const instructorId = formData.get("instructorId") as string;
  const academicYear = formData.get("academicYear") as string;
  const finalExamDate = formData.get("finalExamDate") as string;
  
  // ✅ เพิ่มการรับค่า สาขาวิชา และ ภาคเรียน จากฟอร์ม
  const major = formData.get("major") as any; // ใช้ as any ไปก่อนเพื่อหลีกเลี่ยง Type Error กับ Enum
  const semester = formData.get("semester") as string;

  if (!subjectCode || !nameTh || !instructorId || !major || !semester) {
    throw new Error("ข้อมูลไม่ครบถ้วน กรุณากรอกข้อมูลให้ครบทุกช่องที่มีเครื่องหมาย *");
  }

  // แปลงวันที่ให้ปลอดภัยขึ้น
  let parsedDate = null;
  if (finalExamDate) {
    parsedDate = new Date(finalExamDate);
    if (isNaN(parsedDate.getTime())) {
      parsedDate = null;
    }
  }

  try {
    console.log("กำลังจะเซฟวิชา:", subjectCode, "สาขา:", major, "เทอม:", semester);

    // บันทึกข้อมูลลงฐานข้อมูล
    await prisma.subject.create({
      data: {
        subjectCode: subjectCode.toUpperCase(),
        nameTh: nameTh,
        nameEn: nameEn || null,
        academicYear: academicYear ? parseInt(academicYear) : 2568, 
        
        // ✅ นำค่าที่รับมาจากฟอร์มมาบันทึก
        semester: parseInt(semester), // แปลงเป็นตัวเลขตาม Schema
        major: major, 
        
        finalExamDate: parsedDate,
        
        // สร้างข้อมูลลงตารางกลาง
        instructors: {
          create: {
            userId: instructorId 
          }
        }
      }
    });

  } catch (error: any) {
    console.error("🔥 Create Subject Error:", error);
    throw new Error(error.message || "เกิดข้อผิดพลาดในการบันทึกข้อมูล โปรดดูที่ Terminal");
  }

  revalidatePath('/instructor');
  redirect(`/instructor?uid=${instructorId}&tab=subjects`);
}

// ==========================================
// 2. ฟังก์ชันสำหรับกำหนดวันสอบไฟนอล + แจ้งเตือน
// ==========================================
export async function setFinalExamDate(formData: FormData) {
  const subjectId = formData.get("subjectId") as string;
  const examDate = formData.get("examDate") as string;
  const instructorId = formData.get("instructorId") as string;

  if (!subjectId || !examDate || !instructorId) return;

  try {
    const parsedDate = new Date(examDate);

    // อัปเดตวันสอบในตาราง Subject
    const updatedSubject = await prisma.subject.update({
      where: { id: subjectId },
      data: { finalExamDate: parsedDate },
      include: {
        projects: true
      }
    });

    const formattedDate = parsedDate.toLocaleDateString('th-TH', { 
      year: 'numeric', month: 'long', day: 'numeric',
      hour: '2-digit', minute: '2-digit'
    });

    if (updatedSubject.projects && updatedSubject.projects.length > 0) {
      const notifications = updatedSubject.projects.map(project => ({
        projectId: project.id,
        userId: instructorId,
        action: "EXAM_ANNOUNCEMENT",
        details: `📢 ประกาศกำหนดการสอบไฟนอลวิชา ${updatedSubject.subjectCode}: วันที่ ${formattedDate} น.`
      }));

      await prisma.projectLog.createMany({
        data: notifications
      });
    }

  } catch (error) {
    console.error("Set Exam Date Error:", error);
    return;
  }

  revalidatePath('/instructor');
  redirect(`/instructor?uid=${instructorId}&tab=subjects`);;
}
