'use client';

import {
  IconButton, Menu, MenuItem, Dialog, DialogTitle, DialogContent,
  DialogContentText, DialogActions, Button
} from "@mui/material";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import { useState } from "react";
import { useRouter } from 'next/navigation';
import { useSession } from "next-auth/react";

interface ShopOwnerRequestMenuProps {
  requestId: string;
}

export default function ShopOwnerRequestMenu({ requestId }: ShopOwnerRequestMenuProps) {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [openCancelDialog, setOpenCancelDialog] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();
  const { data: session } = useSession(); // <--- useSession here

  const handleClickMenu = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleCloseMenu = () => {
    setAnchorEl(null);
  };

  const handleClickEdit = () => {
    router.push(`/request/${requestId}/edit`);
    handleCloseMenu();
  };

  const handleClickCancel = () => {
    setOpenCancelDialog(true);
    handleCloseMenu();
  };

  const handleConfirmCancel = async () => {
    setIsSubmitting(true);
    try {
      const token = session?.user.token;
  
      if (!token) {
        throw new Error("No token found in session. Please login again.");
      }
  
      console.log("Trying to delete request ID:", requestId);
  
      const res = await fetch(`${process.env.BACKEND_URL}/api/v1/requests/${requestId}`, {  // <-- correct
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });
  
      if (!res.ok) {
        const errorResponse = await res.text();
        console.error("Backend error response:", errorResponse);
        throw new Error('Failed to cancel request');
      }
  
      router.refresh();
      window.location.reload();
    } catch (error) {
      if (error instanceof Error) {
        console.error("Cancel failed:", error.message);
      } else {
        console.error("Cancel failed:", error);
      }
    } finally {
      setIsSubmitting(false);
      setOpenCancelDialog(false);
    }
  };
  

  return (
    <>
      <IconButton onClick={(e)=>{e.stopPropagation();handleClickMenu(e);}}>
        <MoreVertIcon />
      </IconButton>

      <Menu disableScrollLock anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleCloseMenu} onClick={(e) => {e.stopPropagation();handleCloseMenu();}}>
        <MenuItem onClick={(e)=>{e.stopPropagation();handleClickEdit();}} className="!text-blue-600 hover:!bg-blue-50 w-full text-left">
          Edit
        </MenuItem>
        <MenuItem onClick={(e)=>{e.stopPropagation();handleClickCancel();}} className="!text-red-600 hover:!bg-red-50 w-full text-left">
          Cancel
        </MenuItem>
      </Menu>

      <Dialog disableScrollLock open={openCancelDialog} onClose={() => setOpenCancelDialog(false)}
        PaperProps={{
          className: 'w-full max-w-lg rounded-lg'
        }}
      >
        <DialogTitle>Cancel Request</DialogTitle>
        <DialogContent>
          <DialogContentText>Are you sure you want to cancel this request?</DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={(e) => {e.stopPropagation();setOpenCancelDialog(false);}} disabled={isSubmitting}>Back</Button>
          <Button color="error" onClick={(e)=>{e.stopPropagation();handleConfirmCancel();}} disabled={isSubmitting}>
            {isSubmitting ? 'Cancelling...' : 'Cancel'}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
