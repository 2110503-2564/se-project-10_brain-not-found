// src/components/adminRequestHandlingComponent/AdminRequestMenu.tsx
'use client'

import {
  IconButton, Menu, MenuItem, Dialog, DialogTitle, DialogContent,
  DialogContentText, DialogActions, Button, TextField
} from "@mui/material";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import { useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import approveRequest from "@/libs/approveRequest"; // ตรวจสอบ path ให้ถูกต้อง
import rejectRequest from "@/libs/rejectRequest";   // ตรวจสอบ path ให้ถูกต้อง

interface RequestMenuProps {
  requestId: string;
}

export default function AdminRequestMenu({ requestId }: RequestMenuProps) {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [openApproveDialog, setOpenApproveDialog] = useState(false);
  const [openRejectDialog, setOpenRejectDialog] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { data: session } = useSession();
  const router = useRouter();

  const handleClickMenu = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleCloseMenu = () => {
    setAnchorEl(null);
  };

  const handleCloseRejectDialog = () => {
    setOpenRejectDialog(false);
    setRejectReason(''); // เคลียร์ reason เมื่อปิด
  };

  const handleClickApprove = () => {
    setOpenApproveDialog(true);
    handleCloseMenu();
  };

  const handleClickReject = () => {
    setRejectReason(''); // เคลียร์ reason ก่อนเปิด dialog
    setOpenRejectDialog(true);
    handleCloseMenu();
  };

  const handleConfirmApprove = async () => {
    const token = session?.user?.token;
    if (!token) {
      console.error("No token found. Cannot approve.");
      alert("Authentication error. Please log in again.");
      return;
    }

    setIsSubmitting(true); // เริ่ม Loading
    try {
      // ส่ง requestId และ token ไปยังฟังก์ชัน approveRequest
      await approveRequest(requestId, token); // <--- แก้ไข: ส่ง object ถูกต้องแล้ว
      alert("Request approved successfully!"); // แจ้งเตือนผู้ใช้
      router.refresh(); // รีเฟรชหน้า

    } catch (error) {
      console.error("Approve failed:", error);
      // แสดงข้อผิดพลาดให้ผู้ใช้เห็น
      alert(`Failed to approve request: ${error instanceof Error ? error.message : "Unknown error"}`);

    } finally {
      setIsSubmitting(false); // สิ้นสุด Loading
      setOpenApproveDialog(false); // ปิด dialog
    }
  };

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
      // ส่ง requestId, reason, และ token ไปยังฟังก์ชัน rejectRequest
      await rejectRequest(requestId, token, rejectReason); // <--- แก้ไข: ส่ง object ถูกต้องแล้ว
      alert("Request rejected successfully!"); // แจ้งเตือนผู้ใช้
      router.refresh(); // รีเฟรชหน้า

    } catch (error) {
      console.error("Reject failed:", error);
      // แสดงข้อผิดพลาดให้ผู้ใช้เห็น
      alert(`Failed to reject request: ${error instanceof Error ? error.message : "Unknown error"}`);

    } finally {
      setIsSubmitting(false); // สิ้นสุด Loading
      handleCloseRejectDialog(); // ปิด dialog
    }
  };

  return (
    <>
      {/* menu button (3 จุด) */}
      <IconButton onClick={(e)=>{e.stopPropagation();handleClickMenu(e);}}>
        <MoreVertIcon />
      </IconButton>

      {/* เมนูเมื่อกดเปิด */}
      <Menu
        disableScrollLock // ป้องกันปัญหา scroll lock กับ dialog
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleCloseMenu}
        onClick={(e) => {e.stopPropagation();handleCloseMenu();}} // ปิดเมนูเมื่อคลิกที่เมนูเอง
      >
        <MenuItem
          onClick={(e)=>{e.stopPropagation();handleClickApprove();}}
          className="!text-green-600 hover:!bg-green-50 w-full text-left"
        >
          Approve
        </MenuItem>
        <MenuItem
          onClick={(e)=>{e.stopPropagation();handleClickReject();}}
          className="!text-red-600 hover:!bg-red-50 w-full text-left"
        >
          Reject
        </MenuItem>
      </Menu>

      {/* Approve Dialog */}
      <Dialog
        disableScrollLock
        open={openApproveDialog}
        onClose={(event, reason) => {
            // ป้องกันการปิด dialog จากการคลิก backdrop ถ้ากำลัง submitting
            if (reason === 'backdropClick' && isSubmitting) return;
            setOpenApproveDialog(false);
        }}
        PaperProps={{
          className: 'w-full max-w-md rounded-lg' // ปรับขนาดตามต้องการ
        }}
        onClick={(e) => e.stopPropagation()} // หยุด event ไม่ให้ไปถึง parent
      >
        <DialogTitle>Approve Request</DialogTitle>
        <DialogContent>
          <DialogContentText>Are you sure you want to approve this request?</DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenApproveDialog(false)} disabled={isSubmitting}>Cancel</Button>
          <Button color="success" onClick={handleConfirmApprove} disabled={isSubmitting}>
            {isSubmitting ? 'Approving...' : 'Approve'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Reject Dialog */}
      <Dialog
        disableScrollLock
        open={openRejectDialog}
        onClose={(event, reason) => {
            if (reason === 'backdropClick' && isSubmitting) return;
            handleCloseRejectDialog();
        }}
        PaperProps={{
          className: 'w-full max-w-md rounded-lg' // ปรับขนาดตามต้องการ
        }}
        onClick={(e) => e.stopPropagation()} // หยุด event ไม่ให้ไปถึง parent
      >
        <DialogTitle>Reject Request</DialogTitle>
        <DialogContent>
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
            onClick={(e: React.MouseEvent) => {e.stopPropagation();}} // หยุด event ใน TextField ด้วย
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseRejectDialog} disabled={isSubmitting}>Cancel</Button>
          <Button color="error" onClick={handleConfirmReject} disabled={isSubmitting}>
            {isSubmitting ? 'Rejecting...' : 'Reject'}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
