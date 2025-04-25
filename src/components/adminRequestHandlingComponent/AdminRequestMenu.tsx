'use client'

import {
  IconButton, Menu, MenuItem, Dialog, DialogTitle, DialogContent,
  DialogContentText, DialogActions, Button
} from "@mui/material";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import { useState } from "react";

interface RequestMenuProps {
  onApprove: () => void;
  onReject: () => void;
}

export default function AdminRequestMenu({ onApprove, onReject }: RequestMenuProps) {

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [openApproveDialog, setOpenApproveDialog] = useState(false)
  const [openRejectDialog, setOpenRejectDialog] = useState(false)

  const handleClickMenu = (event: React.MouseEvent<HTMLButtonElement>) => {
  setAnchorEl(event.currentTarget)
  }

  const handleCloseMenu = () => {
      setAnchorEl(null);
  };

  const handleClickApprove = () => {
      setOpenApproveDialog(true)
      handleCloseMenu()
    }
  
  const handleClickReject = () => {
    setOpenRejectDialog(true)
    handleCloseMenu()
  }

  const handleConfirmApprove = () => {
    onApprove()
    setOpenApproveDialog(false)
  }

  const handleConfirmReject = () => {
    onReject()
    setOpenRejectDialog(false)
  }

  return (
    <>
      <IconButton onClick={handleClickMenu}>
        <MoreVertIcon />
      </IconButton>
      <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleCloseMenu}>
        <MenuItem onClick={handleClickApprove}>Approve</MenuItem>
        <MenuItem onClick={handleClickReject}>Reject</MenuItem>
      </Menu>

      {/* Approve Dialog */}
      <Dialog open={openApproveDialog} onClose={() => setOpenApproveDialog(false)}>
        <DialogTitle>Approve Request</DialogTitle>
        <DialogContent>
          <DialogContentText>Are you sure you want to approve this request?</DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenApproveDialog(false)}>Cancel</Button>
          <Button color="success" onClick={handleConfirmApprove}>Approve</Button>
        </DialogActions>
      </Dialog>

      {/* Reject Dialog */}
      <Dialog open={openRejectDialog} onClose={() => setOpenRejectDialog(false)}>
        <DialogTitle>Reject Request</DialogTitle>
        <DialogContent>
          <DialogContentText>Are you sure you want to reject this request?</DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenRejectDialog(false)}>Cancel</Button>
          <Button color="error" onClick={handleConfirmReject}>Reject</Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
