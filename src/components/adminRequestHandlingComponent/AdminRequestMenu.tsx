//You can use this as template for shop owner

'use client'

import {
  IconButton, Menu, MenuItem, Dialog, DialogTitle, DialogContent,
  DialogContentText, DialogActions, Button, TextField
} from "@mui/material";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import { useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import approveRequest from "@/libs/approveRequest";
import rejectRequest from "@/libs/rejectRequest";

interface RequestMenuProps {
  requestId: string;
}

export default function AdminRequestMenu({ requestId }: RequestMenuProps) {
  // Props ไปเรียกฟังก์ชันใน parent component (ใน RequestAction)
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [openApproveDialog, setOpenApproveDialog] = useState(false)
  const [openRejectDialog, setOpenRejectDialog] = useState(false)
  const [rejectReason, setRejectReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { data: session } = useSession(); // <--- useSession here
  const router = useRouter(); // for refresh page

  const handleClickMenu = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget)
  }

  const handleCloseMenu = () => {
    setAnchorEl(null);
  };

  const handleCloseRejectDialog = () => {
    setOpenRejectDialog(false);
    setRejectReason(''); // เคลียร์ reason เมื่อปิด
  }

  const handleClickApprove = () => {
    setOpenApproveDialog(true)
    handleCloseMenu()
  }
  
  const handleClickReject = () => {
    setRejectReason('');
    setOpenRejectDialog(true)
    handleCloseMenu()
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
      {/* menu button (3 จุด) */}
      <IconButton onClick={(e)=>{e.stopPropagation();handleClickMenu(e);}}> 
        <MoreVertIcon />
      </IconButton>

      {/* เมนูเมื่อกดเปิด (แก้สีใน className) */}
      <Menu disableScrollLock anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleCloseMenu} onClick={(e) => {e.stopPropagation();handleCloseMenu();}}>
        <MenuItem onClick={(e)=>{e.stopPropagation();handleClickApprove();}} className="!text-green-600 hover:!bg-green-50 w-full text-left">
          Approve
        </MenuItem>
        <MenuItem onClick={(e)=>{e.stopPropagation();handleClickReject();}} className="!text-red-600 hover:!bg-red-50 w-full text-left">
          Reject
        </MenuItem>
      </Menu>

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
  );
}
