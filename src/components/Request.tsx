// import getRequests from "@/libs/getRequests";
// import { getServerSession } from "next-auth";
// import { authOptions } from "@/app/api/auth/[...nextauth]/authOptions";


// interface RequestItem {
//     _id: string;
//     user: string;
//     userName: string;
//     createdAt: Date;
//     shop: ShopItem;
//     status: string;
//     requestType: string;
//     reason: string;
//     edited: Date;
// }

// export default async function Request() {
//     const session = await getServerSession(authOptions);

//     if (!session || !session.user || !session.user.token) {
//         return (
//             <div className="p-5 text-center text-red-500">
//                 Please log in to view requests.
//             </div>
//         );
//     }

//     let requests: RequestItem[] = [];
//     let errorMessage: string | null = null;

//     try {
//         const requestData = await getRequests(session.user.token);

//         if (requestData && requestData.data) {
//             requests = requestData.data;
//         } else {
//             console.warn("Requests data is not in the expected format:", requestData);
//             requests = [];
//         }
//     } catch (error) {
//         console.error("Failed to fetch requests:", error);
//         errorMessage = "Could not load requests at this time. Please try again later.";
//     }

//     if (errorMessage) {
//         return <div className="p-5 text-center text-red-500">{errorMessage}</div>;
//     }

//     return (
//         <div className="p-5 space-y-4">
//             <h1 className="text-2xl font-bold text-center text-gray-800 mb-6">
//                 Your Requests
//             </h1>
//             {requests.length === 0 ? (
//                 <div className="text-center text-lg text-gray-500">
//                     You have no pending requests.
//                 </div>
//             ) : (
//                 <ul className="space-y-3">
//                     {requests.map((request) => (
//                         <li
//                             key={request._id}
//                             className="bg-white border border-gray-200 rounded-lg p-4 shadow hover:shadow-md transition-shadow duration-200"
//                         >
//                             <p className="font-semibold text-gray-700">
//                                 Shop: <span className="font-normal">{request.shop.name}</span>
//                             </p>
//                             <p className="font-semibold text-gray-700">
//                                 User: <span className="font-normal">{request.userName}</span>
//                             </p>
//                             <p className="font-semibold text-gray-700">
//                                 Date:{" "}
//                                 <span className="font-normal">
//                                     {new Date(request.createdAt).toLocaleDateString()}
//                                 </span>
//                             </p>
//                             <p className="font-semibold text-gray-700">
//                                 Status: <span className="font-normal">{request.status}</span>
//                             </p>
//                         </li>
//                     ))}
//                 </ul>
//             )}
//         </div>
//     );
// }
import getRequests from "@/libs/getRequests";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/authOptions";

interface User {
  name: string;
}

interface RequestItem {
    shop: ShopItem;
  _id: string;
  user: User; // Changed type to User
  createdAt: Date;
  reason: string;
  status: string;
  // No other fields needed here
}

export default async function Request() {
  const session = await getServerSession(authOptions);

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
    const requestData = await getRequests(session.user.token);

    if (requestData && requestData.data) {
      requests = requestData.data;
    } else {
      console.warn("Requests data is not in the expected format:", requestData);
      requests = [];
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
        {/* ส่วนหัวข้อ (Header Row) */}
        {/* ใช้ grid และ grid-cols-5 เพื่อสร้าง 5 คอลัมน์ */}
        {/* กำหนด gap เพื่อให้ระยะห่างคอลัมน์เท่ากัน */}
        <div className="grid grid-cols-5 gap-4 text-gray-700 font-semibold border-b pb-2 mb-2">
            {/* หัวข้อแต่ละคอลัมน์ */}
            <div>Shop name</div>
            <div>User</div>
            <div>Date of Creation</div>
            <div>Status</div>
            <div>Reason</div>
        </div>
    
        {/* ส่วนรายการข้อมูล (List of Requests) */}
        {requests.map((request) => (
            <li
                key={request._id}
                className="bg-white border border-gray-200 rounded-lg p-4 shadow hover:shadow-md transition-shadow duration-200"
            >
                {/* ส่วนข้อมูลแต่ละรายการ (Data Row) */}
                {/* **ต้องใช้ grid และ grid-cols-5 และ gap เดียวกันกับส่วนหัวข้อ** */}
                <div className="grid grid-cols-5 gap-4 text-gray-700">
                    {/* **แสดงเฉพาะค่าข้อมูลในแต่ละคอลัมน์ โดยไม่ต้องมีป้ายชื่อ** */}
                    <div>{request.shop?.name}</div>
                    <div>{request.user.name}</div>
                    <div>{new Date(request.createdAt).toLocaleDateString()}</div>
                    <div>{request.status}</div>
                    <div>{request.reason}</div>
                </div>
            </li>
        ))}
     </ul>
      )}
    </div>
  );
}

