import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import DocumentView from "./DocumentView"; // ✅ เรียกใช้ Client Component แทน

export default async function UploadDocumentPage({ 
  searchParams 
}: { 
  searchParams: { uid?: string } 
}) {
  const resolvedParams = await searchParams;
  const uid = resolvedParams.uid;
  
  if (!uid) {
    redirect('/login');
  }

  // ดึงข้อมูล User และ Project
  const user = await prisma.user.findUnique({
    where: { id: uid },
    include: {
      projects: {
        include: { 
          project: {
            include: {
              documents: {
                orderBy: { uploadedAt: 'desc' }
              }
            }
          } 
        }
      }
    }
  });

  if (!user) {
    redirect('/login');
  }
  
  const activeProject = user.projects[0]?.project;
  const documents = activeProject?.documents || [];

  return (
    <DocumentView 
      uid={uid}
      user={user}
      activeProject={activeProject}
      documents={documents}
    />
  );
}