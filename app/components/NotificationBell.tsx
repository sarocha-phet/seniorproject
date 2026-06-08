'use client'

import { useState, useRef, useEffect } from 'react';
import { BellIcon } from '@heroicons/react/24/outline';

export default function NotificationBell({ notifications }: { notifications: any[] }) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // ฟังก์ชันคลิกพื้นที่อื่นแล้วให้ Pop-up ปิดอัตโนมัติ
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [dropdownRef]);

  return (
    <div className="relative" ref={dropdownRef}>
      {/* ปุ่มกระดิ่ง */}
      <button 
        onClick={() => setIsOpen(!isOpen)} 
        className="relative p-2 text-red-200 hover:text-white transition bg-black/10 hover:bg-black/20 rounded-full"
      >
        <BellIcon className="w-6 h-6" />
        {notifications.length > 0 && (
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-400 rounded-full border border-[#8A151B]"></span>
        )}
      </button>

      {/* Pop-up แจ้งเตือน */}
      {isOpen && (
        <div className="absolute right-0 mt-3 w-80 md:w-96 bg-white rounded-2xl shadow-[0_10px_40px_rgba(0,0,0,0.1)] border border-slate-100 overflow-hidden z-50 animate-in fade-in slide-in-from-top-2">
          <div className="bg-slate-50 px-4 py-3 border-b border-slate-100 flex justify-between items-center">
            <h3 className="font-bold text-slate-800 text-sm">การแจ้งเตือน</h3>
            <span className="text-[10px] font-bold text-slate-400 bg-slate-200 px-2 py-0.5 rounded-full">
              {notifications.length} รายการ
            </span>
          </div>
          
          <div className="max-h-[400px] overflow-y-auto">
            {notifications.length > 0 ? (
              <div className="divide-y divide-slate-50">
                {notifications.map((note) => (
                  <div key={note.id} className="p-4 hover:bg-slate-50 transition-colors flex gap-3 items-start">
                    <div className="w-2 h-2 rounded-full bg-rose-400 mt-1.5 shrink-0"></div>
                    <div>
                      <p className="text-xs font-bold text-slate-800 mb-1">{note.title}</p>
                      <p className="text-[11px] text-slate-500 leading-relaxed mb-2">{note.details}</p>
                      <p className="text-[9px] font-bold text-slate-400">
                        {new Date(note.createdAt).toLocaleDateString('th-TH', { 
                          year: '2-digit', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' 
                        })} น.
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-8 text-center">
                <BellIcon className="w-8 h-8 text-slate-200 mx-auto mb-2" />
                <p className="text-xs text-slate-400 font-medium">ไม่มีการแจ้งเตือนใหม่</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}