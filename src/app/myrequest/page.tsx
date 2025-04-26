import Request from "@/components/RequestClient";
import getRequests from "@/libs/getRequests";
import { getServerSession } from "next-auth";
import { authOptions } from "../api/auth/[...nextauth]/authOptions";
import { redirect } from "next/navigation";

export default async function MyRequestPage() {
  const session = await getServerSession(authOptions);
  
  if (!session || !session.user.token) {
    redirect('/');  // ถ้าไม่มี session หรือ token จะให้ไปหน้าอื่น
  }

  // ดึงข้อมูล request จาก API
  const requestData = await getRequests(session.user.token);
  const requests = requestData?.data || [];

  return (
    <main>
      {/* ส่งข้อมูล requests ไปยัง Request component */}
      <Request requests={requests} isShopOwner={session.user.role === "shopOwner"} />
    </main>
  );
}
