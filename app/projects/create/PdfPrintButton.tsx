'use client';

import { useState } from 'react';
import { DocumentArrowDownIcon } from "@heroicons/react/24/outline";

// ✅ ฟังก์ชันช่วยจัดรูปแบบชื่ออาจารย์
const formatTeacherName = (user: any) => {
  if (!user) return ".......................................................";
  
  let prefix = "";
  if (user.academicRank || user.phdTitle) {
    const rank = user.academicRank || "";
    const phd = user.phdTitle || "";
    prefix = `${rank}${phd}`;
  } else {
    prefix = "อ.";
  }
  
  return `${prefix} ${user.firstName} ${user.lastName}`.trim();
};

// ✅ ฟังก์ชันเคลียร์ข้อความ (แก้ปัญหาการก๊อปปี้จาก PDF แล้วบรรทัดตก)
const cleanText = (text: string | undefined) => {
  if (!text || text.trim() === '') return '.............................................';
  // แยกข้อความด้วยการเว้นบรรทัดคู่ (ย่อหน้า) แล้วลบการเคาะ Enter เดี่ยวๆ ทิ้งให้เชื่อมเป็นบรรทัดเดียวกัน
  return text.split(/\n\s*\n/).map(p => p.replace(/\n/g, ' ')).join('\n\n');
};

export default function PdfPrintButton({ students, lecturers, currentUser, chairPerson }: any) {
  const [data, setData] = useState<any>({
    titleTh: '', titleEn: '', abstract: '', objectives: '', scope: '', s2: null, s3: null, adv: null
  });

  const handlePrint = () => {
    // 1. ดึงข้อมูลจากฟอร์ม
    const titleTh = (document.querySelector('input[name="titleTh"]') as HTMLInputElement)?.value || '.............................................';
    const titleEn = (document.querySelector('input[name="titleEn"]') as HTMLInputElement)?.value || '.............................................';
    
    // ✅ นำข้อความมาผ่านฟังก์ชัน cleanText เพื่อจัดระเบียบบรรทัดใหม่
    const abstractRaw = (document.querySelector('textarea[name="abstract"]') as HTMLTextAreaElement)?.value;
    const objectivesRaw = (document.querySelector('textarea[name="objectives"]') as HTMLTextAreaElement)?.value;
    const scopeRaw = (document.querySelector('textarea[name="scope"]') as HTMLTextAreaElement)?.value;

    const abstract = cleanText(abstractRaw);
    const objectives = cleanText(objectivesRaw);
    const scope = cleanText(scopeRaw);
    
    const studentId2 = (document.querySelector('select[name="studentId2"]') as HTMLSelectElement)?.value;
    const studentId3 = (document.querySelector('select[name="studentId3"]') as HTMLSelectElement)?.value;
    const advisorId = (document.querySelector('select[name="advisorId"]') as HTMLSelectElement)?.value;

    const s2 = students.find((s: any) => s.id === studentId2);
    const s3 = students.find((s: any) => s.id === studentId3);
    const adv = lecturers.find((l: any) => l.id === advisorId);

    setData({ titleTh, titleEn, abstract, objectives, scope, s2, s3, adv });

    setTimeout(() => {
      window.print();
    }, 300);
  };

  return (
    <>
      <button 
        type="button" 
        onClick={handlePrint}
        className="w-full bg-slate-100 text-slate-700 font-bold py-4 rounded-[1.5rem] hover:bg-slate-200 transition-all border border-slate-300 flex justify-center items-center gap-3 text-lg mt-4 shadow-sm"
      >
        <DocumentArrowDownIcon className="w-6 h-6" /> พิมพ์ / ดาวน์โหลดแบบฟอร์ม
      </button>

      {/* --- สไตล์สำหรับตอนปริ้นต์ --- */}
      <style dangerouslySetInnerHTML={{__html: `
        @import url('https://fonts.googleapis.com/css2?family=Sarabun:wght@400;700&display=swap');

        @media print {
          body * { visibility: hidden; }
          #print-section, #print-section * { visibility: visible; }
          #print-section { 
            position: absolute; 
            left: 0; 
            top: 0; 
            width: 100%; 
            background: white; 
            color: black;
            font-family: 'TH SarabunPSK', 'TH Sarabun New', 'Sarabun', sans-serif;
            font-size: 16pt; 
            line-height: 1.35; /* ปรับช่องไฟให้อ่านง่ายขึ้น */
          }
          
          #print-section strong {
            font-weight: bold;
          }

          /* ✅ คลาสพิเศษสำหรับจัดข้อความภาษาไทยให้กระจายเต็มบรรทัด (Justify) */
          .thai-paragraph {
            text-align: justify;
            text-justify: inter-word;
            word-break: break-word;
            white-space: pre-wrap;
          }
        }
        @media screen {
          #print-section { display: none; }
        }
      `}} />

      {/* --- โครงสร้างกระดาษ A4 --- */}
      <div id="print-section">
        <div className="text-center font-bold mb-8 leading-relaxed">
          <p>สาขาวิชาวิศวกรรมคอมพิวเตอร์ คณะวิศวกรรมศาสตร์และเทคโนโลยีอุตสาหกรรม</p>
          <p>แบบขออนุมัติชื่อเรื่องโครงงานและแต่งตั้งอาจารย์ที่ปรึกษา</p>
        </div>

        <table className="w-full mb-6 text-left border-collapse">
          <tbody>
            <tr>
              <td className="py-1 whitespace-nowrap pr-4">ชื่อนักศึกษา {currentUser?.firstName} {currentUser?.lastName}</td>
              <td className="py-1 whitespace-nowrap pr-4">รหัส {currentUser?.username || "......................."}</td>
              <td className="py-1 whitespace-nowrap text-right w-full">ลงชื่อ.................................................</td>
            </tr>
            {data.s2 && (
              <tr>
                <td className="py-1 whitespace-nowrap pr-4">ชื่อนักศึกษา {data.s2.firstName} {data.s2.lastName}</td>
                <td className="py-1 whitespace-nowrap pr-4">รหัส {data.s2.username || "......................."}</td>
                <td className="py-1 whitespace-nowrap text-right w-full">ลงชื่อ.................................................</td>
              </tr>
            )}
            {data.s3 && (
              <tr>
                <td className="py-1 whitespace-nowrap pr-4">ชื่อนักศึกษา {data.s3.firstName} {data.s3.lastName}</td>
                <td className="py-1 whitespace-nowrap pr-4">รหัส {data.s3.username || "......................."}</td>
                <td className="py-1 whitespace-nowrap text-right w-full">ลงชื่อ.................................................</td>
              </tr>
            )}
          </tbody>
        </table>

        <div className="mb-6">
          <p>เป็นนักศึกษาระดับ ปริญญาตรี หลักสูตร วิศวกรรมคอมพิวเตอร์</p>
          <p>ขออนุมัติชื่อเรื่องและแต่งตั้งอาจารย์ที่ปรึกษา</p>
        </div>

        <div className="space-y-4">
          <div>
            <p><strong>1. ชื่อเรื่อง</strong></p>
            <p className="pl-6">(ภาษาไทย) {data.titleTh}</p>
            <p className="pl-6">(ภาษาอังกฤษ) {data.titleEn}</p>
          </div>

          <div>
            <p><strong>2. ที่มาและความสำคัญของปัญหา</strong></p>
            {/* ✅ ใช้คลาส thai-paragraph เพื่อจัดบรรทัดให้สวยงาม */}
            <p className="pl-6 thai-paragraph leading-relaxed">{data.abstract}</p>
          </div>

          <div>
            <p><strong>3. วัตถุประสงค์ของโครงงาน</strong></p>
            <p className="pl-6 thai-paragraph leading-relaxed">{data.objectives}</p>
          </div>

          <div className="mt-8">
            <p><strong>4. อาจารย์ที่ปรึกษา</strong></p>
            <div className="ml-10 mt-4 space-y-2">
              <p>ลงชื่อ........................................................................ อาจารย์ที่ปรึกษาหลัก</p>
              <p className="ml-10">({data.adv ? formatTeacherName(data.adv) : "......................................................."})</p>
              <p className="ml-10">วันที่...........เดือน........................... พ.ศ. ...............</p>
            </div>
          </div>

          <div className="mt-8">
            <p><strong>5. ความเห็นของอาจารย์ประจำรายวิชาการเตรียมโครงงาน</strong></p>
            <div className="ml-6 mt-2 space-y-2">
              <p>( &nbsp; ) ควรอนุมัติชื่อเรื่อง</p>
              <p>( &nbsp; ) ไม่ควรอนุมัติชื่อเรื่อง เนื่องจาก ..........................................................................</p>
              <div className="mt-6 ml-10 space-y-2">
                <p>ลงชื่อ........................................................................ อาจารย์ประจำรายวิชา</p>
                <p className="ml-10">(นายรณชัย สังหมื่นเม้า)</p>
                <p className="ml-10">วันที่...........เดือน........................... พ.ศ. ...............</p>
              </div>
            </div>
          </div>

          <div className="mt-8">
            <p><strong>6. ความเห็นของประธานหลักสูตร</strong></p>
            <div className="ml-6 mt-2 space-y-2">
              <p>( &nbsp; ) ควรอนุมัติชื่อเรื่อง</p>
              <p>( &nbsp; ) ไม่ควรอนุมัติชื่อเรื่อง เนื่องจาก ..........................................................................</p>
              <div className="mt-6 ml-10 space-y-2">
                <p>ลงชื่อ........................................................................ ประธานหลักสูตร</p>
                <p className="ml-10">({chairPerson ? formatTeacherName(chairPerson) : "......................................................."})</p>
                <p className="ml-10">วันที่...........เดือน........................... พ.ศ. ...............</p>
              </div>
            </div>
          </div>

        </div>
      </div>
    </>
  );
}