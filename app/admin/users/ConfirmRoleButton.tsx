'use client' // ✅ บรรทัดนี้บอกว่าไฟล์นี้ทำงานฝั่งผู้ใช้ (ใช้ Popup ได้)

export default function ConfirmRoleButton() {
  return (
    <button 
      type="submit" 
      onClick={(e) => {
        // หากผู้ใช้กด "ยกเลิก" (Cancel) ให้หยุดการส่งฟอร์ม (preventDefault)
        if (!window.confirm("⚠️ คุณแน่ใจหรือไม่ว่าต้องการเปลี่ยนสิทธิ์ (Role) ของผู้ใช้งานคนนี้?")) {
          e.preventDefault();
        }
      }}
      className="p-2.5 bg-[#8A151B] hover:bg-red-800 text-white rounded-xl text-xs font-black transition-colors shadow-sm"
    >
      อัปเดต
    </button>
  );
}