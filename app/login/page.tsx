'use client'

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import {
  UserIcon, ArrowRightEndOnRectangleIcon, LockClosedIcon,
  EyeIcon, EyeSlashIcon
} from "@heroicons/react/24/outline";

import Link from "next/link";
import { useAuthStore } from "../store/authStore";
import { loginWithUsername } from "./actions";

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuthStore();

  const [role, setRole] = useState<'STUDENT' | 'ADVISOR' | 'INSTRUCTOR' | 'CHAIR' | 'ADMIN'>('STUDENT');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const [showPassword, setShowPassword] = useState(false);

  const [errorMsg, setErrorMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // ฟังก์ชันจัดการเมื่อกดปุ่มเข้าสู่ระบบ
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setIsLoading(true);

    if (!username || !password) {
      setErrorMsg('กรุณากรอกชื่อผู้ใช้งานและรหัสผ่านให้ครบถ้วน');
      setIsLoading(false);
      return;
    }

    // เรียกใช้ Server Action
    const res = await loginWithUsername(username, password, role);

    if (res.error) {
      setErrorMsg(res.error);
      setIsLoading(false);
      return;
    }

    if (res.success && res.user) {
      login(res.user);

      switch (role) {
        case "INSTRUCTOR":
          window.location.href = `/instructor?uid=${res.user.id}`; break;
        case "ADVISOR":
          window.location.href = `/lecturer?uid=${res.user.id}`; break;
        case "CHAIR":
          window.location.href = `/head?uid=${res.user.id}`; break;
        case "STUDENT":
          window.location.href = `/student?uid=${res.user.id}`; break;
        case "ADMIN":
          window.location.href = `/admin?uid=${res.user.id}`; break;
        default:
          window.location.href = `/projects?uid=${res.user.id}`;
      }
    }
  };

  return (
    <div className="min-h-screen bg-[#F5F5F5] flex items-center justify-center p-4 font-sans text-slate-900">

      {/* Main Card Container */}
      <div className="w-full max-w-5xl bg-white rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.1)] overflow-hidden flex flex-col md:flex-row">

        {/* --- Left Side (Red Branding) --- */}
        <div className="md:w-1/2 bg-[#8A151B] p-12 flex flex-col items-center justify-center text-center relative overflow-hidden">
          <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '24px 24px' }}></div>

          <div className="relative z-10 flex flex-col items-center">
            <div className="w-40 h-40 bg-white rounded-full flex items-center justify-center mb-8 shadow-2xl p-2">
              <Image
                src="/images/en_ksu.png"
                alt="Kalasin University Logo"
                width={140}
                height={140}
                className="object-contain"
                priority
              />
            </div>
            <h1 className="text-3xl font-black text-white mb-2 leading-snug">
              ระบบบริหารจัดการ<br />โครงงานวิจัย
            </h1>
            <div className="w-16 h-[1px] bg-white/40 my-6"></div>
            <p className="text-white/90 text-sm font-bold leading-relaxed">
              คณะวิศวกรรมศาสตร์และเทคโนโลยีอุตสาหกรรม<br />
              มหาวิทยาลัยกาฬสินธุ์
            </p>
          </div>
        </div>

        {/* --- Right Side (Login Form) --- */}
        <div className="md:w-1/2 p-8 lg:p-14 bg-white flex flex-col justify-center">
          <div className="max-w-sm mx-auto w-full">
     
            <h2 className="text-2xl font-black text-slate-900 mb-2">เข้าสู่ระบบ</h2>
            <p className="text-sm font-bold text-slate-500 mb-8">กรุณาเลือกบทบาทและระบุชื่อผู้ใช้เพื่อเข้าใช้งาน</p>

            {/* Role Tabs */}
            <div className="grid grid-cols-3 gap-1 bg-slate-50 p-1.5 rounded-xl mb-8 border border-slate-100">
              <button type="button" onClick={() => setRole('STUDENT')} className={`py-2 text-[11px] sm:text-xs font-black rounded-lg transition-all ${role === 'STUDENT' ? 'bg-[#8A151B] text-white shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>นักศึกษา</button>
              <button type="button" onClick={() => setRole('ADVISOR')} className={`py-2 text-[11px] sm:text-xs font-black rounded-lg transition-all ${role === 'ADVISOR' ? 'bg-[#8A151B] text-white shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>ที่ปรึกษา</button>
              <button type="button" onClick={() => setRole('INSTRUCTOR')} className={`py-2 text-[11px] sm:text-xs font-black rounded-lg transition-all ${role === 'INSTRUCTOR' ? 'bg-[#8A151B] text-white shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>ประจำวิชา</button>
              <button type="button" onClick={() => setRole('CHAIR')} className={`col-span-1 py-2 text-[11px] sm:text-xs font-black rounded-lg transition-all ${role === 'CHAIR' ? 'bg-[#8A151B] text-white shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>ประธานฯ</button>
              <button type="button" onClick={() => setRole('ADMIN')} className={`col-span-2 py-2 text-[11px] sm:text-xs font-black rounded-lg transition-all ${role === 'ADMIN' ? 'bg-[#8A151B] text-white shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>แอดมิน (ผู้ดูแลระบบ)</button>
            </div>

            {/* Error Box */}
            {errorMsg && (
              <div className="mb-6 p-3 bg-red-50 border border-red-100 rounded-lg text-sm text-red-600 font-bold flex items-center gap-2 shadow-sm">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 shrink-0" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z" clipRule="evenodd" />
                </svg>
                {errorMsg}
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-5">

              <div className="space-y-2">
                <label className="text-xs font-black text-slate-700 uppercase tracking-wider">ชื่อผู้ใช้งาน (Username)</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <UserIcon className="h-5 w-5 text-slate-400" />
                  </div>
                  <input
                    name="username"
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                    placeholder="ระบุชื่อผู้ใช้งาน หรือ รหัสนักศึกษา"
                    className="w-full pl-12 pr-4 py-3 border border-slate-200 rounded-xl text-sm font-bold focus:ring-2 focus:ring-red-100 focus:border-[#8A151B] outline-none transition-all bg-white"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-black text-slate-700 uppercase tracking-wider">รหัสผ่าน (Password)</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <LockClosedIcon className="h-5 w-5 text-slate-400" />
                  </div>
                  <input
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    placeholder="ระบุรหัสผ่านของคุณ"
                    className="w-full pl-12 pr-12 py-3 border border-slate-200 rounded-xl text-sm font-bold focus:ring-2 focus:ring-red-100 focus:border-[#8A151B] outline-none transition-all bg-white"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-slate-600 transition-colors"
                    aria-label={showPassword ? 'ซ่อนรหัสผ่าน' : 'แสดงรหัสผ่าน'}
                  >
                    {showPassword ? (
                      <EyeSlashIcon className="h-5 w-5" /> 
                    ) : (
                      <EyeIcon className="h-5 w-5" /> 
                    )}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className={`w-full bg-[#8A151B] hover:bg-[#6b0f14] text-white font-black py-4 rounded-xl shadow-lg shadow-red-200 transition-all flex items-center justify-center gap-2 mt-6 ${isLoading ? 'opacity-70 cursor-not-allowed' : ''}`}
              >
                {isLoading ? (
                  'กำลังเข้าสู่ระบบ...'
                ) : (
                  <>
                    <ArrowRightEndOnRectangleIcon className="w-5 h-5" />
                    เข้าสู่ระบบ
                  </>
                )}
              </button>
            </form>

            <div className="mt-12 pt-6 border-t border-slate-100 text-center">

              <div className="flex items-center justify-center gap-2 text-xs font-black text-[#8A151B]">
                <Link href="/" className="hover:underline">กลับหน้าหลัก</Link>
                <span className="text-slate-300">|</span>
                <a href="#" className="hover:underline">คู่มือการใช้งาน</a>
                <span className="text-slate-300">|</span>
                <a href="#" className="hover:underline">ติดต่อเรา</a>
              </div>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}