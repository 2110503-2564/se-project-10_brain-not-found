import getRequests from "@/libs/getRequests";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/authOptions";
import RequestClient from "./RequestClient";

export default async function RequestServer({ searchParams }: { searchParams: { filter?: string } }) {
  const session = await getServerSession(authOptions);

  if (!session || !session.user || !session.user.token) {
    return (
      <div className="p-5 text-center text-red-500">
        Please log in to view requests.
      </div>
    );
  }

  let requests = [];
  let errorMessage = null;
  const filter = searchParams.filter || "all"; // ใช้ค่า filter จาก query หรือกำหนดเป็น "all" ถ้าไม่มีค่า

  try {
    const requestData = await getRequests(session.user.token, filter);
    if (requestData?.data) {
      requests = requestData.data;
    } else {
      requests = [];
    }
  } catch (error) {
    console.error("Failed to fetch requests:", error);
    errorMessage = "Could not load requests at this time. Please try again later.";
  }

  if (errorMessage) {
    return <div className="p-5 text-center text-red-500">{errorMessage}</div>;
  }

  return <RequestClient requests={requests} role={session.user.role} token={session.user.token}/>;
}
