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
  shopId: string
  onDeleteSuccess?: () => void
  onEditSuccess?: () => void
  currentHeader?: string
  currentComment?: string
  currentRating?: number
}

export function ReviewMenu({
  reviewId,
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
    if (!session?.user?.token || rating === null) return
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

  return (
    <>
      <IconButton onClick={handleClickMenu}>
        <MoreVerticalIcon />
      </IconButton>
      <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleCloseMenu}>
        <MenuItem onClick={handleClickEdit}>Edit</MenuItem>
        <MenuItem onClick={handleClickDelete}>Delete</MenuItem>
      </Menu>

      {/* Delete Dialog */}
      <Dialog open={openDeleteDialog} onClose={() => toggleDeleteDialog(false)}>
        <DialogTitle>Delete this review?</DialogTitle>
        <DialogContent>
          <DialogContentText>This will permanently delete the review.</DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => toggleDeleteDialog(false)}>Cancel</Button>
          <Button color="error" onClick={handleConfirmDelete}>Delete</Button>
        </DialogActions>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={openEditDialog} onClose={() => toggleEditDialog(false)}>
        <DialogTitle>Edit Review</DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
          <Rating
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
          <Button onClick={() => toggleEditDialog(false)}>Cancel</Button>
          <Button onClick={handleConfirmEdit}>Save</Button>
        </DialogActions>
      </Dialog>
    </>
  )
}
