'use server'

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

// --- ฟังก์ชัน 1: สร้างหัวข้อโครงงานใหม่ (หน้า /projects/create) ---
export async function createProject(formData: FormData) {
  const titleTh = formData.get("titleTh") as string;
  const titleEn = formData.get("titleEn") as string;
  const abstract = formData.get("abstract") as string;
  const objectives = formData.get("objectives") as string; 
  const scope = formData.get('scope') as string;
  const advisorId = formData.get("advisorId") as string;
  const subjectId = formData.get("subjectId") as string; 

  const student1 = formData.get("studentId1") as string;
  const student2 = formData.get("studentId2") as string;
  const student3 = formData.get("studentId3") as string;
  const creatorId = formData.get("creatorId") as string || student1; 

  const membersToCreate: any[] = [];
  if (student1) membersToCreate.push({ user: { connect: { id: student1 } } });
  if (student2 && student2 !== student1) membersToCreate.push({ user: { connect: { id: student2 } } });
  if (student3 && student3 !== student2 && student3 !== student1) membersToCreate.push({ user: { connect: { id: student3 } } });

  const totalProjects = await prisma.project.count();
  const nextNumber = totalProjects + 1;
  const projectCode = `CE-${nextNumber.toString().padStart(3, '0')}`;

  try {
    const newProject = await prisma.project.create({
      data: {
        projectCode,
        titleTh,
        titleEn,
        abstract,
        objectives: objectives || null, 
        scope: scope || null, 
        status: "PENDING_APPROVAL" as any, 
        academicYear: 2568, 
        subjectId: subjectId || null, 

        members: { create: membersToCreate },
        advisors: {
          create: [{ userId: advisorId, role: "ADVISOR" }]
        }
      },
    });

    if (creatorId) {
      await prisma.projectLog.create({
        data: {
          projectId: newProject.id, 
          userId: creatorId,
          action: "CREATED_PROPOSAL",
          details: `เสนอหัวข้อโครงงานใหม่: ${titleTh}`
        }
      });
    }
    return { success: true, creatorId: creatorId };

  } catch (error: any) {
    console.error("Create Project Error:", error);
    return { success: false, error: error.message || "เกิดข้อผิดพลาดในการบันทึกข้อมูล" }; 
  }
}
// --- ฟังก์ชัน 2: อัปโหลดเอกสารต่างๆ (หน้า Student Dashboard) ---
export async function uploadDocument(formData: FormData) {
  const projectId = formData.get("projectId") as string;
  const uploaderId = formData.get("uploaderId") as string;
  const fileType = formData.get("fileType") as string; 
  const file = formData.get("file") as File;

  const mockFilePath = `/uploads/${projectId}/${Date.now()}_${file.name}`;

  try {
    await prisma.document.create({
      data: {
        projectId,
        uploaderId,
        fileType,
        filePath: mockFilePath,
        status: "PENDING" as any 
      }
    });

    if (projectId && uploaderId) {
      await prisma.projectLog.create({
        data: {
          projectId: projectId,
          userId: uploaderId,
          action: "UPLOAD_DOCUMENT",
          details: `อัปโหลดเอกสาร: ${fileType} (${file.name})`
        }
      });
    }

  } catch (error) {
    console.error("Upload Error:", error);
    return;
  }

  revalidatePath("/student/documents");
  redirect(`/student/documents?uid=${uploaderId}`);
}


// --- ฟังก์ชัน 3: แก้ไขรายละเอียดโครงงาน ---
export async function updateProjectDetails(formData: FormData) {
  const projectId = formData.get("projectId") as string;
  const uid = formData.get("uid") as string;
  const role = formData.get("role") as string || 'STUDENT';
  const titleTh = formData.get("titleTh") as string;
  const titleEn = formData.get("titleEn") as string;
  const abstract = formData.get("abstract") as string;
  const objectives = formData.get("objectives") as string; 
  const scope = formData.get("scope") as string;
  const status = formData.get("status");

  if (!projectId) return;

  try {
    const updateData: any = {
      titleTh,
      titleEn,
      abstract,
      objectives,
      scope
    };

    if (status) updateData.status = status as any;

    await prisma.project.update({
      where: { id: projectId },
      data: updateData
    });

    if (uid) {
      await prisma.projectLog.create({
        data: {
          projectId: projectId,
          userId: uid,
          action: "EDIT_PROJECT",
          details: "อัปเดต/แก้ไขข้อมูลรายละเอียดโครงงาน"
        }
      });
    }

  } catch (error) {
    console.error("Update Project Error:", error);
    return;
  }

  revalidatePath(`/projects/${projectId}`);
  redirect(`/projects/${projectId}?uid=${uid}&role=${role}`);
}