import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      bodySizeLimit: '10mb', // ✅ ขยายขีดจำกัดขนาดไฟล์เป็น 10MB (ปรับเพิ่มได้ตามต้องการ)
    },
  },
};

export default nextConfig;
