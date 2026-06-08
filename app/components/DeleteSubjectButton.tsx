'use client'

import { TrashIcon } from "@heroicons/react/24/outline";
import { deleteSubject } from "@/app/admin/actions";

interface Props {
  subjectId: string;
  adminId: string;
}

export default function DeleteSubjectButton({ subjectId, adminId }: Props) {
  const handleDelete = async () => {
    // แสดงหน้าต่างยืนยันก่อนลบ
    const isConfirmed = confirm("คุณแน่ใจหรือไม่ที่จะลบรายวิชานี้? ข้อมูลโครงงานทั้งหมดในวิชานี้จะถูกลบออกด้วย");
    
    if (isConfirmed) {
      const result = await deleteSubject(subjectId, adminId);
      if (!result.success) {
        alert("เกิดข้อผิดพลาดในการลบข้อมูล");
      }
    }
  };

  return (
    <button 
      onClick={handleDelete}
      className="p-2.5 text-rose-600 hover:bg-rose-50 rounded-xl transition-colors"
      title="ลบรายวิชา"
    >
      <TrashIcon className="w-5 h-5" />
    </button>
  );
}