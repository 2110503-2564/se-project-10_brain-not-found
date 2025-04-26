'use client'

import AdminRequestMenu from "./adminRequestHandlingComponent/AdminRequestMenu";

interface RequestActionsProps {
  requestId: string;
  isShopOwner: boolean;
  role: string;
  status: string;
}

export default function RequestActions({ requestId, isShopOwner, role, status }: RequestActionsProps) {
  // admin แสดงเฉพาะตอน pending
  if (role === "admin" && (status === "rejected" || status === "approved")) {
    return null;
  }
  // shopOwner แสดงตอน pending และ rejected
  if (role === "shopOwner" && status === "approved") {
    return null;
  }

  return (
    <>
      {role === "admin" ? (
        <AdminRequestMenu onApprove={() => {}} onReject={() => {}} />
      ) : role === "shopOwner" ? (
        //TODO: implement shopOwner menu component instead 'null'
        'null'
      ) : (
        null
      )}
    </>
  )
}
