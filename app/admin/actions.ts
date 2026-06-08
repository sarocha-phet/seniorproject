'use server'

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

/**
 * ฟังก์ชันสำหรับลบรายวิชา
 * @param subjectId ID ของรายวิชาที่ต้องการลบ
 * @param adminId ID ของแอดมินผู้ทำการลบ (เพื่อใช้บันทึก Log หรือตรวจสอบสิทธิ์)
 */
export async function deleteSubject(subjectId: string, adminId: string) {
  if (!subjectId || !adminId) {
    return { success: false, message: "ข้อมูลไม่ครบถ้วน" };
  }

  try {
    // 1. ตรวจสอบสิทธิ์ว่าเป็น Admin จริงหรือไม่
    const user = await prisma.user.findUnique({
      where: { id: adminId },
      include: { roles: true }
    });

    const isAdmin = user?.roles.some(role => role.name === "ADMIN");
    if (!isAdmin) {
      throw new Error("คุณไม่มีสิทธิ์ในการลบข้อมูล");
    }

    // 2. ลบรายวิชา (Prisma จะลบข้อมูลที่เกี่ยวข้องตาม Relation ที่ตั้งไว้ใน Schema)
    await prisma.subject.delete({
      where: { id: subjectId }
    });

    // 3. อัปเดต Cache ของหน้าจอที่เกี่ยวข้อง
    revalidatePath("/admin/subjects");
    revalidatePath("/"); // อัปเดตหน้าแรกเผื่อมี Widget แสดงวันสอบของวิชานี้

    return { success: true, message: "ลบรายวิชาเรียบร้อยแล้ว" };
  } catch (error: any) {
    console.error("🔥 Delete Subject Error:", error);
    return { success: false, message: error.message || "เกิดข้อผิดพลาดในการลบข้อมูล" };
  }
}

/**
 * ฟังก์ชันสำหรับอัปเดตข้อมูลพื้นฐานของรายวิชา
 */
export async function updateSubjectInfo(formData: FormData) {
  const subjectId = formData.get("subjectId") as string;
  const nameTh = formData.get("nameTh") as string;
  const subjectCode = formData.get("subjectCode") as string;
  const adminId = formData.get("adminId") as string;

  try {
    await prisma.subject.update({
      where: { id: subjectId },
      data: {
        nameTh: nameTh,
        subjectCode: subjectCode.toUpperCase(),
      }
    });

    revalidatePath("/admin/subjects");
    return { success: true };
  } catch (error) {
    console.error("Update Subject Error:", error);
    return { success: false };
  }
}

/**
 * ฟังก์ชันสำหรับเปลี่ยน Role ของ User
 */
export async function updateUserRole(userId: string, roleName: string) {
  try {
    // 1. หา ID ของ Role ที่ต้องการ (เช่น "STUDENT", "ADVISOR")
    const role = await prisma.role.findUnique({
      where: { name: roleName }
    });

    if (!role) throw new Error("ไม่พบชื่อ Role นี้ในระบบ");

    // 2. อัปเดต User โดยการเปลี่ยน Role ทั้งหมดเป็น Role ใหม่
    await prisma.user.update({
      where: { id: userId },
      data: {
        roles: {
          set: [{ id: role.id }] // ใช้ set เพื่อล้าง Role เก่าและใส่ Role ใหม่ทันที
        }
      }
    });

    revalidatePath("/admin/users");
    return { success: true };
  } catch (error) {
    console.error("Change Role Error:", error);
    return { success: false };
  }
}

// ============================================================================
// 🔔 ส่วนที่เพิ่มใหม่: สำหรับระบบแจ้งเตือนและการจัดการเอกสารของแอดมิน
// ============================================================================

/**
 * ฟังก์ชันสำหรับดึงข้อมูลการแจ้งเตือนของแอดมิน (เอกสารที่รอตรวจสอบ)
 */
export async function getAdminNotifications() {
  try {
    // ดึงเอกสารทั้งหมดที่มีสถานะเป็น PENDING
    const pendingDocs = await prisma.document.findMany({
      where: { status: "PENDING" },
      include: {
        project: { select: { titleTh: true, projectCode: true } },
        uploader: { select: { firstName: true, lastName: true } }
      },
      orderBy: { uploadedAt: 'desc' }
    });

    // แปลงรูปแบบข้อมูลให้พร้อมใช้กับ Popup แจ้งเตือน
    const notifications = pendingDocs.map(doc => ({
      id: doc.id,
      title: "มีเอกสารรอตรวจสอบ",
      details: `${doc.fileType} - โครงงาน: ${doc.project.titleTh || 'ไม่ระบุชื่อ'} (ส่งโดย ${doc.uploader.firstName})`,
      createdAt: doc.uploadedAt,
      link: `/admin/documents?highlight=${doc.id}` // กดแล้วเด้งไปหน้าเอกสาร
    }));

    return notifications;
  } catch (error) {
    console.error("Get Notifications Error:", error);
    return [];
  }
}

/**
 * ฟังก์ชันสำหรับอัปเดตสถานะเอกสาร (อนุมัติให้ผ่าน หรือ ปฏิเสธให้ไปแก้ไข)
 */
export async function updateDocumentStatus(documentId: string, newStatus: 'APPROVED' | 'REJECTED') {
  try {
    await prisma.document.update({
      where: { id: documentId },
      data: { status: newStatus }
    });

    // รีเฟรชหน้าแอดมินเพื่อให้กระดิ่งแจ้งเตือนและสถิติอัปเดตทันที
    revalidatePath("/admin");
    revalidatePath("/admin/documents");

    return { success: true };
  } catch (error) {
    console.error("Update Document Status Error:", error);
    return { success: false, message: "เกิดข้อผิดพลาดในการอัปเดตสถานะเอกสาร" };
  }
}