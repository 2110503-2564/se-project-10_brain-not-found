// src/app/request/[id]/edit/page.tsx
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/authOptions';
import { redirect } from 'next/navigation'; // Import redirect
import { notFound } from 'next/navigation'; // Import notFound
import EditRequestForm from '@/components/EditRequestForm';
import getRequest from '@/libs/getRequest'; // Import function ดึงข้อมูล Request

interface PageProps {
    params: {
      id: string; // ID ของ Request จาก URL
    };
}

export default async function EditShopRequestPage({ params }: PageProps) {
    const { id: requestId } = params; // เปลี่ยนชื่อตัวแปรเพื่อความชัดเจน

    // 1. ดึงข้อมูล Session
    const session = await getServerSession(authOptions);

    // 2. ตรวจสอบ Authentication และ Role พื้นฐาน
    if (!session || !session.user.token || session.user.role !== 'shopOwner') {
        // ถ้าไม่ได้ Login หรือไม่ใช่ shopOwner ให้ Redirect ไปหน้าอื่น (เช่น หน้าหลัก หรือ หน้าแจ้งเตือน)
        console.log("Redirecting: Not logged in or not a shopOwner");
        redirect('/'); // หรือ redirect('/');
    }

    try {
        // 3. ดึงข้อมูล Request (ต้องแน่ใจว่า getRequest คืน user._id ของ request ด้วย)
        console.log(`Fetching request data for ID: ${requestId} by user: ${session.user._id}`);
        const requestResult = await getRequest(requestId, session.user.token);

        // 4. ตรวจสอบว่าเจอ Request หรือไม่
        if (!requestResult || !requestResult.success || !requestResult.data) {
            console.log(`Request not found for ID: ${requestId}`);
        }

        const requestData = requestResult.data;

        // 5. ตรวจสอบ Ownership
        // *** สำคัญ: ตรวจสอบว่า requestData.user._id มีอยู่จริง ***
        if (!requestData.user || !requestData.user._id) {
             console.error(`Request data for ID ${requestId} is missing user ID.`);
             // อาจจะแสดง error หรือ redirect ขึ้นอยู่กับนโยบาย
             redirect('/'); // หรือหน้าที่เหมาะสม
        }

        if (requestData.user._id !== session.user._id) {
            // ถ้า ID ของ user ใน session ไม่ตรงกับ ID ของ user ใน request
            console.log(`Ownership mismatch: Session user ${session.user._id} vs Request user ${requestData.user._id}`);
            redirect('/'); // Redirect ไปหน้าแจ้งเตือน
        }

        // 6. ถ้าทุกอย่างผ่าน: Render หน้า Edit
        console.log(`User ${session.user._id} authorized to edit request ${requestId}`);
        return (
          <main className="bg-slate-100 m-5 p-5 rounded-lg shadow-lg"> {/* ปรับปรุง style เล็กน้อย */}
            <div className="space-y-5">
              {/* ส่ง requestId ไปให้ Form */}
              <EditRequestForm requestId={requestId} />
              {/* ไม่ต้องเช็ค Role ซ้ำซ้อนที่นี่ เพราะเช็คไปแล้ว */}
            </div>
          </main>
        );

    } catch (error) {
        console.error("Error during authorization or data fetching:", error);
        // จัดการ Error อื่นๆ ที่อาจเกิดขึ้น (เช่น Network error ตอนเรียก getRequest)
        // อาจจะ Redirect ไปหน้า Error หรือแสดงข้อความ
        redirect('/'); // หรือหน้าที่เหมาะสม
    }
}