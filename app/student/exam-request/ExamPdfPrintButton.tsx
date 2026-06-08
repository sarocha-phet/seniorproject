'use client';

import { DocumentArrowDownIcon } from "@heroicons/react/24/outline";

// ฟังก์ชันจัดรูปแบบชื่ออาจารย์
const formatTeacherName = (user: any) => {
  if (!user) return ".......................................................";
  let prefix = "";
  if (user.academicRank || user.phdTitle) {
    prefix = `${user.academicRank || ""}${user.phdTitle || ""}`;
  } else {
    prefix = "อ.";
  }
  return `${prefix} ${user.firstName} ${user.lastName}`.trim();
};

export default function ExamPdfPrintButton({ project, chairPerson }: any) {
  
  const handlePrint = () => {
    window.print();
  };

  // ดึงข้อมูลอาจารย์ที่ปรึกษาหลัก
  const mainAdvisor = project?.advisors?.find((a: any) => a.role === 'ADVISOR')?.user;
  const coAdvisor = project?.advisors?.find((a: any) => a.role === 'CO_ADVISOR')?.user;

  // ดึงข้อมูลสมาชิก (เรียงตามคนสร้าง หรือคนแรกลงมา)
  const member1 = project?.members?.[0]?.user;
  const member2 = project?.members?.[1]?.user;
  const member3 = project?.members?.[2]?.user;

  return (
    <>
      <button 
        type="button" 
        onClick={handlePrint}
        className="w-full bg-[#8A151B] text-white font-bold py-4 rounded-[1.5rem] hover:bg-slate-900 transition-all shadow-xl flex justify-center items-center gap-3 text-lg mt-4"
      >
        <DocumentArrowDownIcon className="w-6 h-6" /> โหลดแบบฟอร์มขอสอบ (PDF)
      </button>

      {/* --- สไตล์สำหรับตอนปริ้นต์ --- */}
      <style dangerouslySetInnerHTML={{__html: `
        @media print {
          body * { visibility: hidden; }
          #print-exam-section, #print-exam-section * { visibility: visible; }
          #print-exam-section { 
            position: absolute; 
            left: 0; 
            top: 0; 
            width: 100%; 
            padding: 10mm 15mm; 
            background: white; 
            color: black;
            font-size: 16pt; /* ปรับขนาดอักษรให้พอดีกับฟอร์มราชการ */
            font-family: 'Sarabun', 'TH Sarabun PSK', sans-serif;
            line-height: 1.5;
          }
          .page-break { page-break-before: always; }
          .print-hidden { display: none !important; }
        }
        @media screen {
          #print-exam-section { display: none; }
        }
      `}} />

      {/* --- โครงสร้างกระดาษ A4 --- */}
      <div id="print-exam-section">
        
        {/* ================= หน้า 1: คำร้องขอสอบ ================= */}
        <div className="font-bold text-lg mb-4 text-right">
          <p>แบบคำร้องขออนุญาตขึ้นสอบโครงงาน</p>
          <p>EN-012-318 โครงงานวิศวกรรมคอมพิวเตอร์ 4</p>
        </div>

        <div className="text-right mb-6">
          <p>วันที่...........เดือน........................พ.ศ. .................</p>
        </div>

        <div className="mb-6">
          <p><strong>เรื่อง</strong> ขออนุญาตขึ้นสอบโครงงานวิศวกรรมคอมพิวเตอร์ 4</p>
          <p><strong>เรียน</strong> หัวหน้าสาขาวิชาวิศวกรรมคอมพิวเตอร์</p>
        </div>

        <div className="mb-4 leading-relaxed indent-10">
          ข้าพเจ้า (นาย/นาง/นางสาว) {member1 ? `${member1.firstName} ${member1.lastName}` : "..........................................................................."} <br/>
          รหัสนักศึกษา {member1?.username || "..........................."} ชั้นปีที่ ............... หมายเลขโทรศัพท์ .............................<br/>
          มีความประสงค์ขออนุญาตขึ้นสอบโครงงาน เรื่อง
        </div>

        <div className="mb-4 ml-4">
          <p><strong>ชื่อโครงงาน (ภาษาไทย)</strong></p>
          <p className="ml-4 border-b border-dotted border-black w-full min-h-[1.5rem] mb-1">{project?.titleTh || ""}</p>
          <p className="ml-4 border-b border-dotted border-black w-full min-h-[1.5rem]"></p>
          
          <p className="mt-2"><strong>ชื่อโครงงาน (ภาษาอังกฤษ)</strong></p>
          <p className="ml-4 border-b border-dotted border-black w-full min-h-[1.5rem] mb-1">{project?.titleEn || ""}</p>
          <p className="ml-4 border-b border-dotted border-black w-full min-h-[1.5rem]"></p>
        </div>

        <div className="mb-6">
          <p>โดยมี</p>
          <p className="ml-8">อาจารย์ที่ปรึกษาโครงงาน: {mainAdvisor ? formatTeacherName(mainAdvisor) : "........................................................................"}</p>
          <p className="ml-8">อาจารย์ที่ปรึกษาร่วม (ถ้ามี): {coAdvisor ? formatTeacherName(coAdvisor) : "........................................................................"}</p>
        </div>

        <div className="mb-6 leading-relaxed indent-10">
          บัดนี้ ข้าพเจ้าได้ดำเนินการจัดทำโครงงานเสร็จสมบูรณ์ตามขอบเขตและวัตถุประสงค์ที่กำหนดไว้และได้รับความเห็นชอบจากอาจารย์ที่ปรึกษาเรียบร้อยแล้ว จึงใคร่ขออนุญาตขึ้นสอบโครงงานในภาคการศึกษาที่........ ปีการศึกษา........ มีเอกสารแนบประกอบการพิจารณา
          <div className="ml-4 mt-2">
            <p>1. รายงานโครงงานฉบับสมบูรณ์ จำนวน 5 ชุด</p>
            <p>2. แบบประเมินความพร้อมในการสอบโครงงานจากอาจารย์ที่ปรึกษา</p>
            <p>3. เอกสารอื่น ๆ (ถ้ามี) .................................................................</p>
          </div>
        </div>

        <div className="text-center mb-6">
          <p>จึงเรียนมาเพื่อโปรดพิจารณาอนุญาต</p>
        </div>

        {/* ลายเซ็นนักศึกษา */}
        <div className="flex justify-around mt-8 mb-10">
          <div className="text-center">
            <p>ลงชื่อ............................................................. นักศึกษา</p>
            <p className="mt-1">({member1 ? `${member1.firstName} ${member1.lastName}` : "................................................................."})</p>
          </div>
          {member2 && (
            <div className="text-center">
              <p>ลงชื่อ............................................................. นักศึกษา</p>
              <p className="mt-1">({member2.firstName} {member2.lastName})</p>
            </div>
          )}
        </div>

        {/* ความเห็นอาจารย์ & หัวหน้าสาขา */}
        <div className="flex justify-between mt-8 border-t border-black pt-6">
          <div className="w-1/2 pr-4">
            <p className="font-bold mb-2">ความเห็นอาจารย์ที่ปรึกษา</p>
            <p>☐ เห็นควรอนุญาตให้ขึ้นสอบโครงงาน</p>
            <p>☐ ยังไม่ควรอนุญาต เนื่องจาก ..........................</p>
            <p>..........................................................................</p>
            <div className="mt-8 text-center">
              <p>ลงชื่อ.............................................................</p>
              <p className="mt-1">({mainAdvisor ? formatTeacherName(mainAdvisor) : "................................................................."})</p>
              <p className="mt-1">อาจารย์ที่ปรึกษา</p>
              <p className="mt-1">วันที่.............เดือน........................พ.ศ. .................</p>
            </div>
          </div>
          <div className="w-1/2 pl-4 border-l border-black">
            <p className="font-bold mb-2">ความเห็นหัวหน้าสาขาวิชา</p>
            <p>☐ อนุญาต</p>
            <p>☐ ไม่อนุญาต เนื่องจาก ......................................</p>
            <p>..........................................................................</p>
            <div className="mt-8 text-center">
              <p>ลงชื่อ.............................................................</p>
              <p className="mt-1">({chairPerson ? formatTeacherName(chairPerson) : "................................................................."})</p>
              <p className="mt-1">ตำแหน่ง หัวหน้าสาขาวิชาวิศวกรรมคอมพิวเตอร์</p>
              <p className="mt-1">วันที่.............เดือน........................พ.ศ. .................</p>
            </div>
          </div>
        </div>

        {/* ================= หน้า 2: แบบประเมินความพร้อม ================= */}
        <div className="page-break"></div>
        <div className="text-center font-bold text-xl mb-8 mt-10">
          <p>แบบประเมินความพร้อมในการสอบโครงงาน</p>
        </div>

        <div className="mb-6">
          <p className="font-bold mb-4">ประเมินความพร้อมของโครงงาน (ทำเครื่องหมาย ✓ )</p>
          <div className="space-y-3 ml-4">
            <p>☐ 1. ดำเนินงานตามขอบเขตและวัตถุประสงค์ครบถ้วน</p>
            <p>☐ 2. มีผลการทดลอง/ผลการพัฒนา ที่สามารถอธิบายและสรุปผลได้</p>
            <p>☐ 3. รายงานโครงงานจัดทำครบถ้วนตามรูปแบบที่หลักสูตรกำหนด</p>
            <p>☐ 4. การอ้างอิงเอกสารถูกต้องตามหลักวิชาการ</p>
            <p>☐ 5. ระบบ/ชิ้นงาน/โปรแกรม สามารถสาธิตการทำงานได้จริง</p>
            <p>☐ 6. นักศึกษามีความเข้าใจเนื้อหาและสามารถตอบคำถามทางวิชาการได้</p>
          </div>
        </div>

        <div className="mb-10 mt-8">
          <p className="font-bold">ข้อเสนอแนะเพิ่มเติม (ถ้ามี)</p>
          <p className="border-b border-dotted border-black w-full min-h-[2rem] mt-2"></p>
          <p className="border-b border-dotted border-black w-full min-h-[2rem] mt-4"></p>
        </div>

        <div className="text-center w-1/2 ml-auto mt-16">
          <p>ลงชื่อ.............................................................</p>
          <p className="mt-2">({mainAdvisor ? formatTeacherName(mainAdvisor) : "................................................................."})</p>
          <p className="mt-2">อาจารย์ที่ปรึกษา</p>
          <p className="mt-2">วันที่.............เดือน........................พ.ศ. .................</p>
        </div>

      </div>
    </>
  );
}