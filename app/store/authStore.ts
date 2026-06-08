import { create } from 'zustand';

// กำหนดชนิดของข้อมูล User ที่จะเก็บใน Store
export interface UserData {
  id: string;
  username: string;
  firstName: string;
  lastName: string;
  role: string;
}

interface AuthState {
  user: UserData | null;
  login: (userData: UserData) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null, // ค่าเริ่มต้นคือยังไม่ได้ล็อกอิน
  login: (userData) => set({ user: userData }), // บันทึกข้อมูลตอนล็อกอิน
  logout: () => set({ user: null }), // ลบข้อมูลตอนออกจากระบบ
}));