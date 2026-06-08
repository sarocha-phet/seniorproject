'use server'

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function createProject(formData: FormData) {
  
  const titleTh = formData.get("titleTh") as string;
  const titleEn = formData.get("titleEn") as string;
  const abstract = formData.get("abstract") as string;
  const advisorId = formData.get("advisorId") as string;

  const scope = formData.get('scope') as string;

  const student1 = formData.get("studentId1") as string;
  const student2 = formData.get("studentId2") as string;
  const student3 = formData.get("studentId3") as string;

  const membersToCreate: any[] = [];

  if (student1) membersToCreate.push({ user: { connect: { id: student1 } } });
  if (student2 && student2 !== student1) membersToCreate.push({ user: { connect: { id: student2 } } });
  if (student3 && student3 !== student2 && student3 !== student1) membersToCreate.push({ user: { connect: { id: student3 } } });

  const totalProjects = await prisma.project.count();
  const nextNumber = totalProjects + 1;
  const projectCode = `CE-${nextNumber.toString().padStart(3, '0')}`;

  try {
    await prisma.project.create({
      data: {
        projectCode,
        titleTh,
        titleEn,
        abstract,
        scope: scope || null, 

        status: "PENDING_APPROVAL",
        academicYear: 2567,
        members: {
          create: membersToCreate
        },
        advisors: {
          create: [
            {
              userId: advisorId,
              role: "ADVISOR"
            }
          ]
        }
      },
    });
  } catch (error) {
    console.error("Create Project Error:", error);
    
    return; 
  }

  revalidatePath("/projects");
  redirect("/projects");
}


export async function reviewProjectTopic(formData: FormData) {
  const projectId = formData.get("projectId") as string;
  const lecturerId = formData.get("lecturerId") as string;
  const status = formData.get("status") as "APPROVED" | "REJECTED";
  const comment = formData.get("comment") as string;

  try {
    await prisma.project.update({
      where: { id: projectId },
      data: {
        status: status,
        logs: {
          create: {
            userId: lecturerId,
            action: status === "APPROVED" ? "APPROVED_TOPIC" : "REJECTED_TOPIC",
            details: comment || (status === "APPROVED" ? "อนุมัติหัวข้อโครงงาน" : "ไม่อนุมัติหัวข้อโครงงาน")
          }
        }
      }
    });

    if (comment) {
      await prisma.comment.create({
        data: {
          projectId,
          userId: lecturerId,
          message: comment
        }
      });
    }

  } catch (error) {
    console.error("Review Error:", error);
    return;
  }

  redirect(`/lecturer?uid=${lecturerId}`);
}

export async function uploadDocument(formData: FormData) {
  const projectId = formData.get("projectId") as string;
  const uploaderId = formData.get("uploaderId") as string;
  const fileType = formData.get("fileType") as string;
  const file = formData.get("file") as File;

  // ในที่นี้เราจะจำลองว่าอัปโหลดเสร็จแล้ว และได้ path มา
  const mockFilePath = `/uploads/${projectId}/${Date.now()}_${file.name}`;

  try {
    await prisma.document.create({
      data: {
        projectId,
        uploaderId,
        fileType,
        filePath: mockFilePath,
        status: "pending"
      }
    });
  } catch (error) {
    console.error("Upload Error:", error);
    return;
  }
  redirect(`/student?uid=${uploaderId}`);
}
export async function updateMeetingStatus(formData: FormData) {
  const logId = formData.get('logId') as string;
  const status = formData.get('status') as string; // 'APPROVED' หรือ 'REJECTED'

  if (!logId || !status) return;

  await prisma.meetingLog.update({
    where: { id: logId },
    data: { status: status }
  });
  revalidatePath('/lecturer'); 
}
export async function updateProjectStatus(formData: FormData) {
  const projectId = formData.get('projectId') as string;
  const status = formData.get('status') as "APPROVED" | "REJECTED"; 

  if (!projectId || !status) return;

  await prisma.project.update({
    where: { id: projectId },
    data: { status: status }
  });

  revalidatePath('/instructor');
  revalidatePath('/student');
}
