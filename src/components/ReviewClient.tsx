'use client'

import {
  Button, Dialog, DialogActions, DialogContent, DialogContentText,
  DialogTitle, IconButton, Menu, MenuItem, Rating, TextField
} from "@mui/material"
import { MoreVerticalIcon } from "lucide-react"
import React, { useState } from "react"
import deleteReview from "@/libs/deleteReview"
import editReview from "@/libs/editReview"
import { useSession } from "next-auth/react"

type Props = {
  reviewId: string
  reviewOwnerId: string
  shopId: string
  onDeleteSuccess?: () => void
  onEditSuccess?: () => void
  currentHeader?: string
  currentComment?: string
  currentRating?: number
}

export function ReviewMenu({
  reviewId,
  reviewOwnerId,
  shopId,
  onDeleteSuccess,
  onEditSuccess,
  currentHeader = '',
  currentComment = '',
  currentRating = 0,
}: Props) {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)
  const [openDeleteDialog, toggleDeleteDialog] = useState(false)
  const [openEditDialog, toggleEditDialog] = useState(false)
  const { data: session } = useSession()

  const [header, setHeader] = useState(currentHeader)
  const [comment, setComment] = useState(currentComment)
  const [rating, setRating] = useState<number | null>(currentRating)

  const handleClickMenu = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget)
  }

  const handleCloseMenu = () => setAnchorEl(null)

  const handleClickDelete = () => {
    toggleDeleteDialog(true)
    handleCloseMenu()
  }

  const handleClickEdit = () => {
    toggleEditDialog(true)
    handleCloseMenu()
  }

  const handleConfirmDelete = async () => {
    if (!session?.user?.token) return
    try {
      await deleteReview({
        token: session.user.token,
        shopId,
        reviewId
      })
      onDeleteSuccess?.()
    } catch (err: any) {
      alert("Failed to delete review: " + err.message)
    } finally {
      toggleDeleteDialog(false)
    }
  }

  const handleConfirmEdit = async () => {

    if (!session?.user?.token){
      return;
    }

    if (!rating){
      alert('Please add complete information.');
      return;
    }

    try {
      await editReview({
        token: session.user.token,
        shopId,
        reviewId,
        updatedData: {
          header,
          comment,
          rating,
          edited: new Date().toISOString()
        }
      })
      onEditSuccess?.()
    } catch (err: any) {
      alert("Failed to edit review: " + err.message)
    } finally {
      toggleEditDialog(false)
    }
  }

  // Render the menu and buttons only if the user is logged in
  if (!session?.user?.token) {
    return null // Don't render anything if the user is not authorized
  }

  return (
    <>
      {(session?.user?.role === 'admin' || session?.user?._id === reviewOwnerId) && (
        <IconButton onClick={handleClickMenu}>
          <MoreVerticalIcon aria-label="More"/>
        </IconButton>
      )}
      <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleCloseMenu}>
        {(session?.user?._id === reviewOwnerId) && (
          <MenuItem aria-label="Edit" onClick={handleClickEdit}>Edit</MenuItem>
        )}
        <MenuItem aria-label="Delete" onClick={handleClickDelete}>Delete</MenuItem>
        
      </Menu>

      {/* Delete Dialog */}
      <Dialog open={openDeleteDialog} onClose={() => toggleDeleteDialog(false)}>
        <DialogTitle>Delete this review?</DialogTitle>
        <DialogContent>
          <DialogContentText>This will permanently delete the review.</DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button aria-label="Cancel in Delete"  onClick={() => toggleDeleteDialog(false)}>Cancel</Button>
          <Button aria-label="Delete in Delete"  color="error" onClick={handleConfirmDelete}>Delete</Button>
        </DialogActions>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={openEditDialog} onClose={() => toggleEditDialog(false)}>
        <DialogTitle aria-label="Dialog Edit Review">Edit Review</DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
          <Rating aria-label="Rating in Edit Review"
            value={rating}
            onChange={(_, newValue) => setRating(newValue)}
          />
          <TextField
            label="Title"
            value={header}
            onChange={(e) => setHeader(e.target.value)}
            fullWidth
          />
          <TextField
            label="Comment"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            fullWidth
            multiline
            minRows={3}
          />
        </DialogContent>
        <DialogActions>
          <Button aria-label="Cancel in Edit" onClick={() => toggleEditDialog(false)}>Cancel</Button>
          <Button aria-label="Save in Edit" onClick={handleConfirmEdit}>Save</Button>
        </DialogActions>
      </Dialog>
    </>
  )
}
