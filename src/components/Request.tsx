import getRequests from "@/libs/getRequests";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/authOptions"; // Assuming this is the correct path

interface RequestItem {
   
      user: string;
        createdAt: Date;
        shop: ShopItem;
        status: string;
        requestType: string;
        reason: string;
        edited: Date;
}

export default async function Request() {
    const session = await getServerSession(authOptions);

    // Ensure user is logged in and has a token
    if (!session || !session.user || !session.user.token) {
        return (
            <div className="p-5 text-center text-red-500">
                Please log in to view requests.
            </div>
        );
    }

    let requests: RequestItem[] = [];
    let errorMessage: string | null = null;

    try {
        // Fetch requests using the user's token
        const requestData = await getRequests(session.user.token);
        // Assuming requestData has a 'data' property containing the array
        if (requestData && requestData.data) {
             requests = requestData.data;
        } else {
            // Handle cases where data might be missing or in a different format
             console.warn("Requests data is not in the expected format:", requestData);
             requests = []; // Default to empty array if format is unexpected
        }
    } catch (error) {
        console.error("Failed to fetch requests:", error);
        errorMessage = "Could not load requests at this time. Please try again later.";
    }

    if (errorMessage) {
        return <div className="p-5 text-center text-red-500">{errorMessage}</div>;
    }

    return (
        <div className="p-5 space-y-4">
            <h1 className="text-2xl font-bold text-center text-gray-800 mb-6">
                Your Requests
            </h1>
            {requests.length === 0 ? (
                <div className="text-center text-lg text-gray-500">
                    You have no pending requests.
                </div>
            ) : (
                <ul className="space-y-3">
                    {requests.map((request) => (
                        <li
                            key={request._id}
                            className="bg-white border border-gray-200 rounded-lg p-4 shadow hover:shadow-md transition-shadow duration-200"
                        >
                            {/* Display request details - Adjust properties based on your RequestItem interface */}
                            <p className="font-semibold text-gray-700">Shop: <span className="font-normal">{request.shop.name}</span></p>
                            <p className="font-semibold text-gray-700">User: <span className="font-normal">{request.userName}</span></p>
                            <p className="font-semibold text-gray-700">Date: <span className="font-normal">{new Date(request.requestDate).toLocaleDateString()}</span></p>
                            {/* Add more details as needed */}
                            {/* <p>Status: {request.status}</p> */}
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}
