'use server'

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { writeFile, mkdir } from "fs/promises";
import { join } from "path";

export async function uploadLocalFile(formData: FormData) {
  try {
    // 1. ดึงข้อมูลจาก FormData
    const file = formData.get('file') as File;
    const projectId = formData.get('projectId') as string;
    const uploaderId = formData.get('uploaderId') as string;
    const fileType = formData.get('fileType') as string;

    if (!file || !projectId || !uploaderId || !fileType) {
      return { error: "ข้อมูลไม่ครบถ้วน กรุณาลองใหม่อีกครั้ง" };
    }

    // 2. แปลงไฟล์เป็น Buffer เพื่อเตรียมบันทึกลงเครื่อง
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // 3. สร้างชื่อไฟล์ใหม่เพื่อป้องกันชื่อซ้ำกัน
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const originalName = file.name;
    const extension = originalName.split('.').pop();
    const filename = `${uniqueSuffix}.${extension}`;

    // 4. กำหนดโฟลเดอร์ปลายทาง (จะถูกเก็บไว้ใน /public/uploads/documents)
    const uploadDir = join(process.cwd(), 'public', 'uploads', 'documents');
    
    // ตรวจสอบและสร้างโฟลเดอร์ถ้ายังไม่มี
    await mkdir(uploadDir, { recursive: true });

    // 5. นำไฟล์ไปวางในโฟลเดอร์ที่เตรียมไว้
    const filepath = join(uploadDir, filename);
    await writeFile(filepath, buffer);

    // 6. กำหนด Path สำหรับให้ Browser เรียกดูได้
    const fileUrl = `/uploads/documents/${filename}`;

    // 7. บันทึกประวัติการส่งเอกสารลง Database
    await prisma.document.create({
      data: {
        projectId: projectId,
        uploaderId: uploaderId,
        fileType: fileType,
        filePath: fileUrl, // ✅ บันทึก URL ที่เป็นพาธในเครื่องเรา
        status: "PENDING"
      }
    });

    if (fileType.startsWith("Chapter")) {
      const chapterNum = parseInt(fileType.replace("Chapter ", ""));

      const existingChapter = await prisma.projectChapter.findFirst({
        where: { projectId: projectId, chapterNumber: chapterNum }
      });

      if (existingChapter) {
        await prisma.projectChapter.update({
          where: { id: existingChapter.id },
          data: {
            content: fileUrl,
            status: "PENDING", 
            updatedAt: new Date()
          }
        });
      } else {
        await prisma.projectChapter.create({
          data: {
            projectId: projectId,
            chapterNumber: chapterNum,
            title: `บทที่ ${chapterNum}`,
            content: fileUrl, 
            status: "PENDING"
          }
        });
      }
    }
    // 8. บันทึก Log ลงตาราง ProjectLog
    await prisma.projectLog.create({
      data: {
        projectId: projectId,
        userId: uploaderId,
        action: "UPLOAD_DOCUMENT",
        details: `อัปโหลดเอกสาร: ${fileType} (${originalName})`
      }
    });

    // 9. รีเฟรชหน้าเพื่อให้ข้อมูลอัปเดต
    revalidatePath(`/student/documents`);
    return { success: true };

  } catch (error) {
    console.error("Upload Local Error:", error);
    return { error: "เกิดข้อผิดพลาดในการบันทึกไฟล์ลงเซิร์ฟเวอร์" };
  }
}

export async function deleteDocument(formData: FormData) {
  const documentId = formData.get("documentId") as string;
  
  if (!documentId) return;

  try {
    const doc = await prisma.document.findUnique({
      where: { id: documentId }
    });

    if (doc) {
      if (doc.fileType.startsWith("Chapter")) {
        const chapterNum = parseInt(doc.fileType.replace("Chapter ", ""));

        await prisma.projectChapter.deleteMany({
          where: { 
            projectId: doc.projectId,
            chapterNumber: chapterNum 
          }
        });
      }

      await prisma.document.delete({
        where: { id: documentId }
      });
    }

    revalidatePath('/student/documents');
  } catch (error) {
    console.error("Delete Document Error:", error);
  }
}