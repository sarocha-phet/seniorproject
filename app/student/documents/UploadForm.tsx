'use client';

import { useState, useRef } from "react";
import { uploadLocalFile } from "./actions"; 
import { 
  DocumentArrowUpIcon, 
  CheckCircleIcon, 
  XCircleIcon,
  ExclamationTriangleIcon,
  CloudArrowUpIcon
} from "@heroicons/react/24/outline";

export default function UploadForm({ projectId, uploaderId }: { projectId: string, uploaderId: string }) {
  const [fileType, setFileType] = useState('');
  const [status, setStatus] = useState<'IDLE' | 'UPLOADING' | 'SUCCESS' | 'ERROR'>('IDLE');
  const [message, setMessage] = useState('');
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const file = fileInputRef.current?.files?.[0];

    if (!file || !fileType) {
      setStatus('ERROR');
      setMessage('กรุณาเลือกประเภทเอกสารและแนบไฟล์ให้ครบถ้วน');
      return;
    }

    setStatus('UPLOADING');
    setMessage('');

    const formData = new FormData();
    formData.append('file', file);
    formData.append('projectId', projectId);
    formData.append('uploaderId', uploaderId);
    formData.append('fileType', fileType);

    const result = await uploadLocalFile(formData);

    if (result.success) {
      setStatus('SUCCESS');
      setMessage('อัปโหลดและบันทึกเอกสารเรียบร้อยแล้ว!');
      setFileType('');
      if (fileInputRef.current) fileInputRef.current.value = ''; // เคลียร์ไฟล์
    } else {
      setStatus('ERROR');
      setMessage(result.error || 'เกิดข้อผิดพลาดในการอัปโหลด');
    }
  };

  return (
    <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 overflow-hidden sticky top-10">
      <div className="bg-[#8A151B] p-8 text-white text-center">
        <div className="w-16 h-16 bg-white/20 rounded-3xl flex items-center justify-center mx-auto mb-4 backdrop-blur-sm shadow-inner">
          <DocumentArrowUpIcon className="w-8 h-8 text-white" />
        </div>
        <h3 className="text-xl font-black tracking-tight">อัปโหลดเอกสาร</h3>
      </div>

      <div className="p-8 space-y-6">
        
        {/* แจ้งเตือนสถานะ */}
        {status === 'SUCCESS' && (
          <div className="bg-emerald-50 border border-emerald-200 p-3 rounded-xl flex items-center gap-2 text-emerald-700 font-bold text-sm">
            <CheckCircleIcon className="w-5 h-5 shrink-0" /> {message}
          </div>
        )}
        {status === 'ERROR' && (
          <div className="bg-rose-50 border border-rose-200 p-3 rounded-xl flex items-center gap-2 text-rose-700 font-bold text-sm">
            <XCircleIcon className="w-5 h-5 shrink-0" /> {message}
          </div>
        )}

        <form onSubmit={handleUpload} className="space-y-6">
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-500 ml-1 uppercase tracking-wider">ประเภทเอกสาร <span className="text-red-500">*</span></label>
            <select 
              value={fileType}
              onChange={(e) => setFileType(e.target.value)}
              disabled={status === 'UPLOADING'}
              className="w-full bg-slate-50 border border-slate-200 text-slate-700 font-medium text-sm rounded-2xl px-5 py-3.5 focus:ring-2 focus:ring-red-100 focus:border-[#8A151B] outline-none transition-all appearance-none disabled:opacity-50"
            >
              <option value="">-- กรุณาเลือกประเภท --</option>
              <option value="Proposal">แบบเสนอหัวข้อโครงงาน (Proposal)</option>
              <option value="Chapter 1">รายงานบทที่ 1 (บทนำ)</option>
              <option value="Chapter 2">รายงานบทที่ 2 (ทฤษฎีที่เกี่ยวข้อง)</option>
              <option value="Chapter 3">รายงานบทที่ 3 (วิธีดำเนินงาน)</option>
              <option value="Progress Report">รายงานความก้าวหน้า (Progress Report)</option>
              <option value="Full Paper">เล่มโครงงานฉบับสมบูรณ์ (1-5)</option>
              <option value="Other">เอกสารอื่นๆ</option>
            </select>
          </div>

          {/* ตรวจสอบว่าเลือกประเภทหรือยัง ถ้ายังให้ซ่อนปุ่มอัปโหลด */}
          {!fileType ? (
            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6 text-center">
              <ExclamationTriangleIcon className="w-8 h-8 text-amber-500 mx-auto mb-2" />
              <p className="text-sm font-bold text-amber-700">กรุณาเลือกประเภทเอกสาร<br/>ก่อนทำการอัปโหลด</p>
            </div>
          ) : (
            <div className="space-y-4 animate-in fade-in slide-in-from-top-2">
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 ml-1 uppercase tracking-wider">แนบไฟล์ (PDF, DOCX) <span className="text-red-500">*</span></label>
                
                <div className="border-2 border-dashed border-red-200 rounded-3xl bg-slate-50 hover:bg-red-50/50 transition-colors p-6 relative group overflow-hidden">
                  <input 
                    type="file" 
                    ref={fileInputRef}
                    accept=".pdf,.doc,.docx"
                    disabled={status === 'UPLOADING'}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed z-10"
                    onChange={() => setStatus('IDLE')}
                  />
                  <div className="flex flex-col items-center justify-center text-center pointer-events-none">
                     <CloudArrowUpIcon className="w-10 h-10 text-[#8A151B] mb-2 group-hover:scale-110 transition-transform" />
                     <p className="text-sm font-bold text-[#8A151B]">คลิกเพื่อเลือกไฟล์ หรือ ลากไฟล์มาวางที่นี่</p>
                     <p className="text-xs text-slate-400 mt-1">รองรับไฟล์ .PDF, .DOCX ขนาดไม่เกิน 10MB</p>
                     
                     {/* แสดงชื่อไฟล์เมื่อเลือกแล้ว */}
                     {fileInputRef.current?.files?.[0] && (
                       <div className="mt-4 px-4 py-2 bg-[#8A151B] text-white rounded-lg text-xs font-bold truncate max-w-[200px]">
                         {fileInputRef.current.files[0].name}
                       </div>
                     )}
                  </div>
                </div>
              </div>

              <button 
                type="submit"
                disabled={status === 'UPLOADING'}
                className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold px-6 py-4 rounded-xl mt-4 transition-all shadow-md disabled:opacity-70 flex items-center justify-center gap-2"
              >
                {status === 'UPLOADING' ? (
                  <>
                     <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                     กำลังอัปโหลด...
                  </>
                ) : (
                  'อัปโหลดไฟล์'
                )}
              </button>
            </div>
          )}
        </form>

      </div>
    </div>
  );
}