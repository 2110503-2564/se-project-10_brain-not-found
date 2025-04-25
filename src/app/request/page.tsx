import Request from "@/components/Request";
import getRequests from "@/libs/getRequests";
import { getServerSession } from "next-auth";
import { authOptions } from "../api/auth/[...nextauth]/authOptions";
import { redirect } from "next/navigation";

export default async function MyRequestPage() {
  const session = await getServerSession(authOptions);
  if (!session || !session.user.token) {
    redirect("/mybooking");
  }

  // Get initial request data
  const requestData = await getRequests(session.user.token, "all");

  return (
    <main className="p-5">
      <h1 className="text-2xl font-bold text-center mb-6">Your Requests</h1>
      <Request initialRequests={requestData?.data || []} token={session.user.token} />
    </main>
  );
}
