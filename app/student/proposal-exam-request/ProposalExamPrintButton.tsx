'use client';

import { useState } from 'react';
import { DocumentArrowDownIcon } from "@heroicons/react/24/outline";

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

export default function ProposalExamPrintButton({ project, currentUser, chairPerson, departmentHead, courseInstructor}: any) {
  const [data, setData] = useState<any>({
    examDate: '', examTime: '', examRoom: ''
  });

  const handlePrint = () => {
    const examDate = (document.querySelector('input[name="examDate"]') as HTMLInputElement)?.value || '.........................';
    const examTime = (document.querySelector('input[name="examTime"]') as HTMLInputElement)?.value || '..................';
    const examRoom = (document.querySelector('input[name="examRoom"]') as HTMLInputElement)?.value || '.........................';

    setData({ examDate, examTime, examRoom });

    setTimeout(() => {
      window.print();
    }, 300);
  };

  const members = project?.members?.map((m: any) => m.user) || [currentUser];
  const s1 = members[0] || currentUser;
  const s2 = members[1] || null;
  const s3 = members[2] || null;

  const mainAdvisor = project?.advisors?.find((a: any) => a.role === 'ADVISOR')?.user || null;
  const coAdvisor = project?.advisors?.find((a: any) => a.role === 'CO_ADVISOR')?.user || null;
  

  return (
    <>
      <button 
        type="button" 
        onClick={handlePrint}
        className="w-full bg-blue-50 text-blue-700 font-bold py-4 rounded-[1.5rem] hover:bg-blue-100 transition-all border border-blue-200 flex justify-center items-center gap-3 text-lg mt-4 shadow-sm"
      >
        <DocumentArrowDownIcon className="w-6 h-6" /> พิมพ์แบบขออนุมัติสอบเค้าโครง
      </button>

      {/* --- สไตล์สำหรับตอนปริ้นต์ --- */}
      <style dangerouslySetInnerHTML={{__html: `
        @import url('https://fonts.googleapis.com/css2?family=Sarabun:wght@400;700&display=swap');
        @page {
          size: A4;
          margin: 0; 
        }

        @media print {
          body * { visibility: hidden; }
          #print-section-exam, #print-section-exam * { visibility: visible; }
          #print-section-exam { 
            position: absolute; 
            left: 0; 
            top: 0; 
            width: 100%; 
            padding: 2cm 2cm 2cm 2cm;
            background: white; 
            color: black;
            font-family: 'TH SarabunPSK', 'TH Sarabun New', 'Sarabun', sans-serif;
            font-size: 16pt; 
            line-height: 1.35; 
          }
          #print-section-exam strong {
            font-weight: bold;
          }
        }
        @media screen {
          #print-section-exam { display: none; }
        }
      `}} />

      {/* --- โครงสร้างกระดาษ A4 แบบขอสอบเค้าโครง --- */}
      <div id="print-section-exam">
        <div className="text-center font-bold mb-6 leading-relaxed">
          <p>สาขาวิชาวิศวกรรมคอมพิวเตอร์ คณะวิศวกรรมศาสตร์และเทคโนโลยีอุตสาหกรรม</p>
          <p>แบบขออนุมัติสอบเค้าโครงของโครงงาน</p>
        </div>

        {/* ข้อมูลนักศึกษา */}
        <table className="w-full mb-4 text-left border-collapse">
          <tbody>
            <tr>
              <td className="py-1 whitespace-nowrap pr-4 w-[45%]">ชื่อนักศึกษา {s1?.firstName} {s1?.lastName}</td>
              <td className="py-1 whitespace-nowrap pr-4 w-[25%]">รหัส {s1?.username || "......................."}</td>
              <td className="py-1 whitespace-nowrap text-right w-[30%]">ลงชื่อ.................................................</td>
            </tr>
            {s2 && (
              <tr>
                <td className="py-1 whitespace-nowrap pr-4">ชื่อนักศึกษา {s2.firstName} {s2.lastName}</td>
                <td className="py-1 whitespace-nowrap pr-4">รหัส {s2.username || "......................."}</td>
                <td className="py-1 whitespace-nowrap text-right">ลงชื่อ.................................................</td>
              </tr>
            )}
            {s3 && (
              <tr>
                <td className="py-1 whitespace-nowrap pr-4">ชื่อนักศึกษา {s3.firstName} {s3.lastName}</td>
                <td className="py-1 whitespace-nowrap pr-4">รหัส {s3.username || "......................."}</td>
                <td className="py-1 whitespace-nowrap text-right">ลงชื่อ.................................................</td>
              </tr>
            )}
          </tbody>
        </table>

        <div className="mb-6">
          <p>เป็นนักศึกษาระดับ ปริญญาตรี หลักสูตร วิศวกรรมคอมพิวเตอร์</p>
          <p>ขออนุมัติสอบเค้าโครงของโครงงาน</p>
        </div>

        <div className="space-y-4">
          {/* 1. ชื่อเรื่อง */}
          <div>
            <p><strong>1. ชื่อเรื่อง</strong></p>
            <p className="pl-6">(ภาษาไทย) {project?.titleTh || "........................................................................................"}</p>
            <p className="pl-6">(ภาษาอังกฤษ) {project?.titleEn || "........................................................................................"}</p>
          </div>

          {/* 2. อาจารย์ที่ปรึกษาเห็นชอบ */}
          <div className="mt-6">
            <p><strong>2. อาจารย์ที่ปรึกษาเห็นชอบแล้ว</strong></p>
            <div className="ml-10 mt-2 space-y-4">
              <div>
                <p>ลงชื่อ........................................................................ อาจารย์ที่ปรึกษาหลัก</p>
                <table className="ml-8 mt-1 border-none text-left">
                  <tbody>
                    <tr>
                      <td className="w-[320px]">({mainAdvisor ? formatTeacherName(mainAdvisor) : "......................................................."})</td>
                      <td>วันที่...........เดือน........................... พ.ศ. ...............</td>
                    </tr>
                  </tbody>
                </table>
              </div>
              
              <div>
                <p>ลงชื่อ........................................................................ อาจารย์ที่ปรึกษาร่วม</p>
                <table className="ml-8 mt-1 border-none text-left">
                  <tbody>
                    <tr>
                      <td className="w-[320px]">({coAdvisor ? formatTeacherName(coAdvisor) : "......................................................."})</td>
                      <td>วันที่...........เดือน........................... พ.ศ. ...............</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* 3. กำหนดสอบ */}
          <div className="mt-6">
            <p><strong>3. กำหนดให้มีการสอบเค้าโครงของโครงงาน</strong></p>
            <p className="ml-6 mt-1">
              วันที่...........เดือน........................... พ.ศ. ............... เวลา.................. น. สถานที่/ห้อง.........................
            </p>
            <div className="ml-10 mt-4 space-y-1">
              <p>ลงชื่อ........................................................................ อาจารย์ประจำรายวิชาการเตรียมโครงงาน</p>
              <table className="ml-8 mt-1 border-none text-left">
                <tbody>
                  <tr>
                    <td className="w-[320px]">({courseInstructor ? formatTeacherName(courseInstructor) : "......................................................."})</td>
                    <td>วันที่...........เดือน........................... พ.ศ. ...............</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* 4. ประธานหลักสูตร */}
          <div className="mt-6">
            <p><strong>4. ความเห็นของประธานหลักสูตร</strong></p>
            <div className="ml-6 mt-1 space-y-1">
              <p>( &nbsp; ) ควรอนุมัติให้มีการสอบเค้าโครง</p>
              <p>( &nbsp; ) ไม่ควรอนุมัติให้มีการสอบเค้าโครง เนื่องจาก................................................................................................</p>
              <div className="mt-4 ml-4 space-y-1">
                <p>ลงชื่อ........................................................................ ประธานหลักสูตร</p>
                <table className="ml-8 mt-1 border-none text-left">
                  <tbody>
                    <tr>
                      <td className="w-[320px]">({chairPerson ? formatTeacherName(chairPerson) : "......................................................."})</td>
                      <td>วันที่...........เดือน........................... พ.ศ. ...............</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* 5. หัวหน้าสาขาวิชา */}
          <div className="mt-6">
            <p><strong>5. ความเห็นของหัวหน้าสาขาวิชา</strong></p>
            <div className="ml-6 mt-1 space-y-1">
              <p>( &nbsp; ) อนุมัติ</p>
              <p>( &nbsp; ) ไม่อนุมัติ เนื่องจาก...........................................................................................................................................</p>
              <div className="mt-4 ml-4 space-y-1">
                <p>ลงชื่อ........................................................................ หัวหน้าสาขาวิชา</p>
                <table className="ml-8 mt-1 border-none text-left">
                  <tbody>
                    <tr>
                      <td className="w-[320px]">({departmentHead ? formatTeacherName(departmentHead) : "......................................................."})</td>
                      <td>วันที่...........เดือน........................... พ.ศ. ...............</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
          
          <div className="mt-8 font-bold text-sm">
            <p>หมายเหตุ : นักศึกษาต้องแนบรูปเล่มเค้าโครงตามจำนวนของกรรมการสอบ</p>
          </div>

        </div>
      </div>
    </>
  );
}