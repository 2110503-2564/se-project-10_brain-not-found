"use client";

import approveRequest from "@/libs/approveRequest";
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
                <EditButton status={status}/>
                <DeleteButton/>
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

function EditButton({status} : {status: string}) {

    const handleClick = () => {
        return null;
    }

    return (
        <Button color="primary" variant="contained" disabled={status === 'approved'} onClick={handleClick}>
            Edit
        </Button>
    )
}

function DeleteButton() {

    const handleClick = () => {
        return null;
    }

    return (
        <Button color="error" variant="contained" onClick={handleClick}>
            Delete
        </Button>
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
          await approveRequest({ requestId, token });
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
          await rejectRequest({ requestId, reason: rejectReason, token });
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