"use client";

import approveRequest from "@/libs/approveRequest";
import { deleteFileFromGCS } from "@/libs/gcsUpload";
import getRequest from "@/libs/getRequest";
import rejectRequest from "@/libs/rejectRequest";
import { ExpandLess, ExpandMore } from "@mui/icons-material";
import {
  Badge,
  Button,
  Card,
  CardActionArea,
  CardContent,
  CardHeader,
  Collapse,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Divider,
  Popover,
  TextField,
  Typography,
} from "@mui/material";
import { Session } from "next-auth";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import React from "react";
import { useState } from "react";

export function ServiceCard({ service }: { service: ServiceData }) {
  const [expanded, setExpanded] = useState(false);
  return (
    <Card>
      <CardActionArea
        onClick={() => {
          setExpanded(!expanded);
        }}
      >
        <CardContent sx={{ display: "flex", flexGrow: 1 }}>
          <Typography variant="body1" component="h4" width="95%">
            {service.name}
          </Typography>
          {expanded ? <ExpandLess /> : <ExpandMore />}
        </CardContent>
        <Collapse in={expanded}>
          <Divider />
          <CardContent>
            <Typography variant="body2">
              Description: {service.desc}{" "}
            </Typography>
            <Typography variant="body2">Price: {service.price} </Typography>
            <Typography variant="body2">
              Duration: {service.duration}{" "}
            </Typography>
          </CardContent>
        </Collapse>
      </CardActionArea>
    </Card>
  );
}

export function RequestInfoStatus({ request }: { request: RequestData }) {
  const [anchorEl, setAnchorEl] = React.useState<HTMLButtonElement | null>(
    null
  );

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const open = Boolean(anchorEl);

  if (request.status === "pending") {
    return (
      <>
        <Typography display="inline">Status: </Typography>
        <span className="border rounded-md border-gray-400 shadow-md px-2 py-1">
          <Typography variant="button" component="span" fontWeight={700}>
            Pending
          </Typography>
        </span>
      </>
    );
  } else if (request.status === "approved") {
    return (
      <>
        <Typography display="inline">Status: </Typography>
        <span className="border rounded-md bg-green-500 border-gray-400 shadow-md px-2 py-1">
          <Typography
            variant="button"
            component="span"
            fontWeight={700}
            color={"white"}
          >
            Approved
          </Typography>
        </span>
      </>
    );
  } else if (request.status === "rejected") {
    return (
      <>
        <Typography display="inline">Status: </Typography>
        <Badge color="info" badgeContent="" variant="dot">
          <Button
            color="error"
            variant="contained"
            size="small"
            sx={{ fontWeight: 700 }}
            onClick={handleClick}
          >
            Rejected
          </Button>
          <Popover
            open={open}
            anchorEl={anchorEl}
            onClose={handleClose}
            anchorOrigin={{
              vertical: "bottom",
              horizontal: "center",
            }}
            transformOrigin={{
              vertical: "top",
              horizontal: "center",
            }}
          >
            <Typography variant="body1">{request.reason}</Typography>
          </Popover>
        </Badge>
      </>
    );
  } else return <Typography variant="h6">Error: Unknown Status</Typography>;
}

export function RequestInfoButtonGroup({session, status, requestId} : {session: Session, status: string, requestId: string}) {
    const { role } = session.user;

    // A little unsure about the role handling logic
    // Will come back to fix this later
    // For now, rejected request can be re-edited
    // Also didn't use the provided button becaus they don't accept the status prop

    if (role === 'shopOwner') {
        return (
            <div className="flex justify-evenly w-full">
                <EditButton status={status} requestId={requestId}/>
                <DeleteButton status={status} requestId={requestId}/>
            </div>
        )
    } else if (role === 'admin') {
        return (
            <div className="flex justify-evenly w-full">
                <ApproveButton status={status} requestId={requestId}/>
                <RejectButton status={status} requestId={requestId}/>
            </div>
        )
    }
}

function EditButton({status, requestId} : {status: string, requestId: string}) {

  const router = useRouter();
    const handleClick = () => {
      router.push(`/request/${requestId}/edit`);
        return;
    }

    return (
        <Button color="primary" variant="contained" disabled={status === 'approved'} onClick={handleClick}>
            Edit
        </Button>
    )
}

function DeleteButton({ requestId, status }: { requestId: string, status: string }) { // รับ requestId และ status
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { data: session } = useSession();
  const router = useRouter();
  console.log("id:", requestId, "status:", status);

      const handleClickDelete = () => {
        setOpenDeleteDialog(true);
    };

    const handleCloseDeleteDialog = () => {
        setOpenDeleteDialog(false);
    }

  const handleConfirmDelete = async () => {
    setIsSubmitting(true);
    let requestData: RequestData; // เก็บข้อมูล request ที่ fetch มา

    try {
        const token = session?.user.token;
        if (!token) {
            throw new Error("No token found in session. Please login again.");
        }

        console.log("Step 1: Fetching request data for ID:", requestId);
        // --- 1. ดึงข้อมูล Request ---
        const requestResult = await getRequest(requestId, token);
        if (!requestResult.success || !requestResult.data) {
            throw new Error("Failed to fetch request details before deletion.");
        }
        requestData = requestResult.data;
        if (!requestData.shop) {
          throw new Error("Shop data is missing from the request.");
        }
        console.log("Request data fetched:", requestData);

        // --- 2. เตรียม Path และเรียก deleteFileFromGCS ---
        const picturePaths = requestData.shop.picture || [];
        const certificatePath = requestData.shop?.certificate ;

        const pathsToDelete = [...picturePaths];
        if (certificatePath) {
            pathsToDelete.push(certificatePath);
        }

        if (pathsToDelete.length > 0) {
            console.log("Step 2: Attempting to delete GCS files:", pathsToDelete);
            await Promise.allSettled( // ใช้ allSettled เพื่อให้ทำงานต่อแม้บางไฟล์จะลบไม่สำเร็จ
                pathsToDelete.map(async (gcsPath) => {
                    try {
                        await deleteFileFromGCS(gcsPath);
                        console.log(`Successfully deleted GCS file: ${gcsPath}`);
                    } catch (deleteError) {
                        // Log error แต่ไม่ throw เพื่อให้ลบ DB ต่อได้
                        console.error(`Failed to delete GCS file ${gcsPath}:`, deleteError);
                    }
                })
            );
            console.log("Finished attempting GCS file deletions.");
        } else {
            console.log("Step 2: No GCS files associated with this request to delete.");
        }

        // --- 3. เรียก API ลบ Database ---
        console.log("Step 3: Deleting request record from database for ID:", requestId);
        const res = await fetch(`${process.env.BACKEND_URL}/api/v1/requests/${requestId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`,
            },
        });

        if (!res.ok) {
            const errorResponse = await res.text();
            console.error("Backend error response (DB Deletion):", errorResponse);
            // อาจจะพิจารณาว่าควรแจ้ง Error เรื่องลบ DB ไม่สำเร็จหรือไม่ แม้จะลบไฟล์ไปแล้ว
            throw new Error('Failed to delete request record from database');
        }

        console.log("Request record deleted successfully from database");
        alert("Request deleted successfully!");
        router.push('/request'); // Redirect (ใช้ /request หรือ /myrequest ตามที่ถูกต้อง)
        router.refresh();

    } catch (error) {
        // จัดการ Error ทั้งหมดที่เกิดขึ้น
        if (error instanceof Error) {
            console.error("Delete process failed:", error.message);
            alert(`Delete failed: ${error.message}`);
        } else {
            console.error("Delete process failed:", error);
            alert("An unknown error occurred during deletion.");
        }
    } finally {
        setIsSubmitting(false);
        setOpenDeleteDialog(false);
    }

  };
  return (
    <>
        {/* ปุ่ม Delete จะ disable ถ้า status เป็น approved */}
        <Button color="error" variant="contained" onClick={handleClickDelete} disabled={status === 'approved' || isSubmitting}>
            Delete
        </Button>

        {/* Delete Confirmation Dialog */}
        <Dialog disableScrollLock open={openDeleteDialog} onClose={handleCloseDeleteDialog}
            PaperProps={{
                className: 'w-full max-w-lg rounded-lg'
            }}
        >
            <DialogTitle>Delete Request</DialogTitle>
            <DialogContent>
                <DialogContentText>Are you sure you want to delete this request? This action cannot be undone.</DialogContentText>
            </DialogContent>
            <DialogActions>
                <Button onClick={(e) => {e.stopPropagation(); handleCloseDeleteDialog();}} disabled={isSubmitting}>Cancel</Button>
                <Button color="error" onClick={(e)=>{e.stopPropagation(); handleConfirmDelete();}} disabled={isSubmitting}>
                    {isSubmitting ? 'Deleting...' : 'Delete'}
                </Button>
            </DialogActions>
        </Dialog>
    </>
)
}

function ApproveButton({status, requestId} : {status: string, requestId: string}) {

    const [openApproveDialog, setOpenApproveDialog] = useState(false)
    const [isSubmitting, setIsSubmitting] = useState(false);
  
    const { data: session } = useSession(); // <--- useSession here
    const router = useRouter(); // for refresh page

    const handleClick = () => {
        setOpenApproveDialog(true)
    }

    const handleConfirmApprove = async () => {
        const token = session?.user?.token;
        if (!token) {
          console.error("No token found. Cannot approve.");
          alert("Authentication error. Please log in again.");
          return;
        }
    
        setIsSubmitting(true); // เริ่ม Loading
        try {
          await approveRequest( requestId, token );
          router.refresh();
    
        } catch (error) {
          console.error("Approve failed:", error);
    
        } finally {
          setIsSubmitting(false); // สิ้นสุด Loading
          setOpenApproveDialog(false);
        }
      }

    return (
        <>
            <Button color="success" variant="contained" disabled={status !== 'pending' || isSubmitting} onClick={handleClick}>
                Approve
            </Button>
            
            {/* Approve Dialog */}
            <Dialog disableScrollLock open={openApproveDialog} onClose={() => setOpenApproveDialog(false)}
            PaperProps={{
                className: 'w-full max-w-lg rounded-lg'
            }}
            >
                <DialogTitle>Approve Request</DialogTitle>
                <DialogContent>
                    <DialogContentText>Are you sure you want to approve this request?</DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={(e) => {e.stopPropagation();setOpenApproveDialog(false)}} disabled={isSubmitting}>Cancel</Button>
                    <Button color="success" onClick={(e)=>{e.stopPropagation();handleConfirmApprove()}} disabled={isSubmitting}>
                    {isSubmitting ? 'Approving...' : 'Approve'}
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    )
}

function RejectButton({status, requestId} : {status: string, requestId: string}) {

    const [openRejectDialog, setOpenRejectDialog] = useState(false)
    const [rejectReason, setRejectReason] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const { data: session } = useSession(); // <--- useSession here
    const router = useRouter(); // for refresh page

    const handleClick = () => {
        setRejectReason('');
        setOpenRejectDialog(true)
    }

    const handleCloseRejectDialog = () => {
        setOpenRejectDialog(false);
        setRejectReason(''); // เคลียร์ reason เมื่อปิด
    }

    const handleConfirmReject = async () => {
        const token = session?.user?.token;
        if (!token) {
          console.error("No token found. Cannot reject.");
          alert("Authentication error. Please log in again.");
          return;
        }
        if (!rejectReason.trim()) {
            alert("Please provide a reason for rejection.");
            return;
        }
    
        setIsSubmitting(true); // เริ่ม Loading
        try {
          await rejectRequest( requestId,rejectReason, token );
          router.refresh()
    
        } catch (error) {
          console.error("Reject failed:", error);
    
        } finally {
          setIsSubmitting(false); // สิ้นสุด Loading
          handleCloseRejectDialog();
        }
    }

    return (
        <>
            <Button color="error" variant="contained" disabled={status !== 'pending' || isSubmitting} onClick={handleClick}>
                Reject
            </Button>

            {/* Reject Dialog */}
            <Dialog disableScrollLock open={openRejectDialog} onClose={handleCloseRejectDialog}
            PaperProps={{
                className: 'w-full max-w-lg rounded-lg'
            }}
            >
            <DialogTitle>Reject Request</DialogTitle>
            <DialogContent onClick={(e: React.MouseEvent) => {e.stopPropagation();}}>
                <TextField
                disabled={isSubmitting} 
                autoFocus
                margin="dense"
                id="rejectReason"
                label="Reason for Rejection"
                type="text"
                fullWidth
                variant="outlined"
                multiline
                rows={3}
                value={rejectReason} // ผูกค่ากับ State
                onChange={(e) => setRejectReason(e.target.value)} // อัปเดต State
                />
            </DialogContent>
            <DialogActions>
                <Button onClick={(e)=>{e.stopPropagation();handleCloseRejectDialog();}} disabled={isSubmitting}>Cancel</Button>
                <Button color="error" onClick={(e)=>{e.stopPropagation();handleConfirmReject();}} disabled={isSubmitting}>
                {isSubmitting ? 'Rejecting...' : 'Reject'}
                </Button>
            </DialogActions>
            </Dialog>
        </>
    )
}