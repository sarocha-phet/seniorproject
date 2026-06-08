'use client';

import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { useState, useEffect, useCallback } from 'react';
import { MagnifyingGlassIcon, Squares2X2Icon, ListBulletIcon} from "@heroicons/react/24/outline";

type ProjectFilterBarProps = {
  subjects?: { id: string; subjectCode: string; nameTh: string }[];
  majors?: string[];
};

export default function ProjectFilterBar({ subjects = [], majors = [] }: ProjectFilterBarProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  
  // ดึงค่าเริ่มต้นจาก URL มาแสดง
  const currentQ = searchParams.get('q') || '';
  const currentStatus = searchParams.get('status') || '';
  const currentYear = searchParams.get('year') || '';
  const currentMajor = searchParams.get('major') || '';       // ✅ ดึงค่า major
  const currentSubject = searchParams.get('subject') || ''; // ดึงค่าวิชา
  const currentView = searchParams.get('view') || 'grid';

  const [searchTerm, setSearchTerm] = useState(currentQ);

  const createQueryString = useCallback(
    (name: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value) params.set(name, value);
      else params.delete(name);
      return params.toString();
    },
    [searchParams]
  );

 useEffect(() => {
    if (searchTerm === currentQ) return; 

    const delayDebounceFn = setTimeout(() => {
      updateFilter('q', searchTerm);
    }, 500); 
    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm, currentQ]);

  const updateFilter = (key: string, value: string) => {
    router.push(`${pathname}?${createQueryString(key, value)}`, { scroll: false }); 
  };

  return (
    <div className="bg-white p-3 rounded-2xl border border-slate-200 shadow-sm flex flex-col lg:flex-row gap-4 justify-between items-center">
      
      {/* 1. ช่องค้นหา */}
      <div className="relative w-full lg:max-w-md">
        <MagnifyingGlassIcon className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="ค้นหาจากชื่อโครงงาน ชื่อนักศึกษา หรือที่ปรึกษา..."
          className="w-full bg-slate-50 pl-12 pr-4 py-2.5 rounded-xl text-sm border-none focus:ring-2 focus:ring-red-100 outline-none transition-all"
        />
      </div>

      <div className="flex items-center gap-3 w-full lg:w-auto overflow-x-auto pb-2 lg:pb-0">
        
        {/* 2. ตัวกรองสถานะ */}
        <select 
          value={currentStatus}
          onChange={(e) => updateFilter('status', e.target.value)}
          className="px-4 py-2.5 bg-slate-50 hover:bg-slate-100 rounded-xl text-xs font-bold text-slate-600 outline-none cursor-pointer border border-transparent focus:border-red-200 transition-all shrink-0"
        >
          <option value="">สถานะทั้งหมด</option>
          <option value="APPROVED">สอบผ่านแล้ว</option>
          <option value="IN_PROGRESS">กำลังดำเนินการ</option>
          <option value="PENDING_APPROVAL">รอดำเนินการ</option>
          <option value="REJECTED">ไม่ผ่าน</option>
        </select>

        {/* 3. ตัวกรองปีการศึกษา */}
        <select 
          value={currentYear}
          onChange={(e) => updateFilter('year', e.target.value)}
          className="px-4 py-2.5 bg-slate-50 hover:bg-slate-100 rounded-xl text-xs font-bold text-slate-600 outline-none cursor-pointer border border-transparent focus:border-red-200 transition-all shrink-0"
        >
          <option value="">ปีการศึกษาทั้งหมด</option>
          <option value="2568">2568</option>
          <option value="2567">2567</option>
          <option value="2566">2566</option>
        </select>

        {/* ✅ 4. ตัวกรองสาขา (Major) */}
        <select 
          value={currentMajor}
          onChange={(e) => updateFilter('major', e.target.value)}
          className="px-4 py-2.5 bg-slate-50 hover:bg-slate-100 rounded-xl text-xs font-bold text-slate-600 outline-none cursor-pointer border border-transparent focus:border-red-200 transition-all shrink-0 max-w-[150px] truncate"
        >
          <option value="">สาขาทั้งหมด</option>
          {majors.map((major, idx) => (
            <option key={idx} value={major}>{major}</option>
          ))}
        </select>

        {/* ✅ 5. ตัวกรองรายวิชา */}
        <select 
          value={currentSubject}
          onChange={(e) => updateFilter('subject', e.target.value)}
          className="px-4 py-2.5 bg-slate-50 hover:bg-slate-100 rounded-xl text-xs font-bold text-slate-600 outline-none cursor-pointer border border-transparent focus:border-red-200 transition-all shrink-0 max-w-[150px] truncate"
        >
          <option value="">รายวิชาทั้งหมด</option>
          {subjects.map((sub: any) => (
            <option key={sub.id} value={sub.id}>{sub.subjectCode}</option>
          ))}
        </select>

        <div className="w-px h-6 bg-slate-200 mx-2 hidden sm:block"></div>
        
        {/* 6. ปุ่มเปลี่ยนมุมมอง */}
        <div className="flex gap-1 shrink-0">
          <button 
            onClick={() => updateFilter('view', 'grid')}
            className={`p-2 rounded-lg transition-colors ${currentView === 'grid' ? 'text-red-600 bg-red-50' : 'text-slate-400 hover:bg-slate-50'}`}
          >
            <Squares2X2Icon className="w-5 h-5" />
          </button>
          <button 
            onClick={() => updateFilter('view', 'list')}
            className={`p-2 rounded-lg transition-colors ${currentView === 'list' ? 'text-red-600 bg-red-50' : 'text-slate-400 hover:bg-slate-50'}`}
          >
            <ListBulletIcon className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}