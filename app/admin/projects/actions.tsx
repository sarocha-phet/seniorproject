'use server'

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

// ฟังก์ชันลบโครงงาน
export async function deleteProjectAction(projectId: string) {
  try {
    // ลบโครงงานจากฐานข้อมูล (Prisma จะลบข้อมูลที่เชื่อมโยงกันตามเงื่อนไข Cascade ที่ตั้งไว้)
    await prisma.project.delete({
      where: { id: projectId }
    });

    // รีเฟรชหน้าเว็บเพื่อให้ตารางอัปเดตข้อมูลล่าสุด
    revalidatePath('/admin/projects');
    return { success: true };

  } catch (error) {
    console.error("Delete Project Error:", error);
    return { error: "ไม่สามารถลบโครงงานได้ อาจมีข้อมูลที่ผูกติดอยู่ กรุณาลองใหม่อีกครั้ง" };
  }
}