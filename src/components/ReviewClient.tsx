'use client'

import { Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, IconButton, Menu, MenuItem } from "@mui/material"
import { MoreVerticalIcon } from "lucide-react"
import React from "react";

export function ReviewMenu() {

    const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
    const [openDeleteDialog, toggleDeleteDialog] = React.useState(false);
    const openMenu = Boolean(anchorEl);
    const handleClickMenu = (event: React.MouseEvent<HTMLButtonElement>) => {
        setAnchorEl(event.currentTarget);
    };
    const handleCloseMenu = () => {
        setAnchorEl(null);
    };
    const handleClickDelete = () => {
      toggleDeleteDialog(true);
    };
    const handleCloseDeleteDialog = () => {
      toggleDeleteDialog(false);
    };

    return (
      <>
        <IconButton onClick={handleClickMenu}>
          <MoreVerticalIcon />
        </IconButton>
        <Menu anchorEl={anchorEl} open={openMenu} onClose={handleCloseMenu}>
          <MenuItem>Edit</MenuItem>
          <MenuItem onClick={handleClickDelete}>Delete</MenuItem>
        </Menu>
        <Dialog open={openDeleteDialog} onClose={handleCloseDeleteDialog}>
          <DialogTitle>Delete this review?</DialogTitle>
          <DialogContent>
            <DialogContentText>This will permanently delete the review.</DialogContentText>
          </DialogContent>
          <DialogActions>
           <Button color="error" onClick={handleCloseDeleteDialog}>Delete</Button>
          </DialogActions>
        </Dialog>
      </>
    );
}
