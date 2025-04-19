// src/components/ReviewClient.tsx
'use client'

import { Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, IconButton, Menu, MenuItem, CircularProgress } from "@mui/material";
import { MoreVerticalIcon } from "lucide-react";
import React, { useState } from "react";
// Import Session type for better prop typing
import type { Session } from 'next-auth';

// Define the props the component expects
interface ReviewMenuProps {
    session: Session | null; // Current user session
    shopId: string;          // ID of the shop
    reviewId: string;        // ID of the review
    ownerId: string;         // ID of the user who wrote the review
    onDelete: (reviewId: string) => Promise<void>; // Function to call when delete is confirmed
    // Add onEdit prop later if needed: onEdit: (reviewId: string) => void;
}

export function ReviewMenu({ session, shopId, reviewId, ownerId, onDelete }: ReviewMenuProps) {
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false); // Loading state for delete action
    const openMenu = Boolean(anchorEl);

    // --- Permission Checks ---
    // User can delete if they are an admin OR if they are the owner of the review
    const canDelete = session?.user && (session.user.role === 'admin' || session.user._id === ownerId);
    // User can edit ONLY if they are the owner (example for future use)
    const canEdit = session?.user && session.user._id === ownerId;

    // --- Menu Handlers ---
    const handleClickMenu = (event: React.MouseEvent<HTMLButtonElement>) => {
        setAnchorEl(event.currentTarget);
    };

    const handleCloseMenu = () => {
        setAnchorEl(null);
    };

    // --- Delete Dialog Handlers ---
    const handleClickDeleteOption = () => {
        handleCloseMenu(); // Close the menu first
        setOpenDeleteDialog(true); // Open the confirmation dialog
    };

    const handleCloseDeleteDialog = () => {
        // Prevent closing if deletion is in progress
        if (!isDeleting) {
            setOpenDeleteDialog(false);
        }
    };

    // --- Confirm Delete Action ---
    const handleConfirmDelete = async () => {
        setIsDeleting(true); // Show loading state
        try {
            // Call the onDelete function passed from the parent component
            // This function (in ReviewSection) will handle the API call and refreshing
            await onDelete(reviewId);
            // If onDelete resolves successfully, close the dialog
            handleCloseDeleteDialog();
        } catch (error) {
            // Error handling (like alerts) is managed in the onDelete function in ReviewSection
            console.error("Deletion failed (from ReviewMenu perspective):", error);
            // Keep the dialog open on failure? Or close it? Closing for now.
            // handleCloseDeleteDialog();
        } finally {
            // Always stop the loading state, whether success or failure
            setIsDeleting(false);
        }
    };

    // --- Render Logic ---
    // Don't render the menu button at all if the user isn't logged in
    // or if they don't have permission to perform any action (edit/delete) on this review.
    if (!session || (!canEdit && !canDelete)) {
        return null; // Render nothing if no actions are possible for the current user
    }

    return (
      <>
        {/* Menu Button */}
        <IconButton onClick={handleClickMenu} disabled={isDeleting}>
          <MoreVerticalIcon />
        </IconButton>

        {/* Actions Menu */}
        <Menu anchorEl={anchorEl} open={openMenu} onClose={handleCloseMenu}>
          {/* Only show Edit if user is the owner */}
          {canEdit && <MenuItem onClick={handleCloseMenu /* TODO: Implement Edit */} disabled>Edit</MenuItem>}

          {/* Only show Delete if user has permission */}
          {canDelete && (
            <MenuItem onClick={handleClickDeleteOption} disabled={isDeleting}>
              Delete
            </MenuItem>
          )}
        </Menu>

        {/* Delete Confirmation Dialog */}
        <Dialog open={openDeleteDialog} onClose={handleCloseDeleteDialog}>
          <DialogTitle>Delete this review?</DialogTitle>
          <DialogContent>
            <DialogContentText>
              This action cannot be undone and will permanently delete the review.
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            {/* Cancel Button */}
            <Button onClick={handleCloseDeleteDialog} disabled={isDeleting}>
              Cancel
            </Button>
            {/* Confirm Delete Button */}
            <Button
              color="error"
              onClick={handleConfirmDelete} // Call the confirmation handler
              disabled={isDeleting} // Disable while deleting
            >
              {isDeleting ? <CircularProgress size={24} color="inherit" /> : 'Delete'}
            </Button>
          </DialogActions>
        </Dialog>
      </>
    );
}
