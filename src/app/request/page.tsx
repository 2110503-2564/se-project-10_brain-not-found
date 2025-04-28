import Request from "@/components/RequestClient";
import getRequests from "@/libs/getRequests";
import { getServerSession } from "next-auth";
import { authOptions } from "../api/auth/[...nextauth]/authOptions";
import { redirect } from "next/navigation";

export default async function MyRequestPage({
  searchParams,
}: {
  searchParams: { filter?: string };
}) {
  const session = await getServerSession(authOptions);

  if (!session || !session.user.token) {
    redirect("/"); // ถ้าไม่มี session หรือ token จะให้ไปหน้าอื่น
  }

  const filter = searchParams.filter || "all";

  // ดึงข้อมูล request จาก API โดยส่ง filter เข้าไป
  const requestData = await getRequests(session.user.token, filter);
  const requests = requestData?.data || [];

  return (
    <main>
      {/* ส่งข้อมูล requests ไปยัง Request component */}
      <Request
        requests={requests}
        role={session.user.role}   // <-- ส่ง role จาก session
        token={session.user.token} // <-- ส่ง token จาก session
      />
    </main>
  );
}
