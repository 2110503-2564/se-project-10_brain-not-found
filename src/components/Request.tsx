"use client";

import { useState, useEffect } from "react";
import getRequests from "@/libs/getRequests";

interface RequestItem {
  shop: { name: string };
  _id: string;
  user: { name: string };
  createdAt: Date;
  reason: string;
  status: string;
}

interface RequestProps {
  initialRequests: RequestItem[];
  token: string;
}

export default function Request({ initialRequests, token }: RequestProps) {
  const [requests, setRequests] = useState<RequestItem[]>(initialRequests);
  const [filter, setFilter] = useState("all");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchRequests = async () => {
      try {
        setLoading(true);

        console.log("Fetching requests for filter:", filter);
        const requestData = await getRequests(token, filter);
        console.log("Received request data:", requestData);
        setRequests(requestData?.data || []);
      } catch (error) {
        console.error("Failed to fetch requests:", error);
        setErrorMessage("Could not load requests at this time. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchRequests();
  }, [filter]);

  return (
    <div className="p-5 space-y-4">
      {/* Move filter dropdown to the right */}
      <div className="flex justify-end mb-4">
        <label className="mr-2 font-semibold">Filter by status:</label>
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="border p-2 rounded"
        >
          <option value="all">All</option>
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
        </select>
      </div>

      {errorMessage && <div className="text-center text-red-500">{errorMessage}</div>}

      {loading ? (
        <div className="text-center text-lg text-gray-500">Loading requests...</div>
      ) : requests.length === 0 ? (
        <div className="text-center text-lg text-gray-500">You have no matching requests.</div>
      ) : (
        <ul className="space-y-3">
          {requests.map((request) => (
            <li key={request._id} className="bg-white border border-gray-200 rounded-lg p-4 shadow">
              <div className="grid grid-cols-5 gap-4 text-gray-700">
                <div className="text-center">{request.shop?.name}</div>
                <div className="text-center">{request.user.name}</div>
                <div className="text-center">{new Date(request.createdAt).toLocaleDateString()}</div>
                <div className="text-center">{request.status}</div>
                <div className="text-center">{request.reason}</div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
