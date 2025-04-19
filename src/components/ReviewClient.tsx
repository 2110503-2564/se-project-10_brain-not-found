'use client'

import {
  Button, Dialog, DialogActions, DialogContent, DialogContentText,
  DialogTitle, IconButton, Menu, MenuItem
} from "@mui/material"
import { MoreVerticalIcon } from "lucide-react"
import React from "react"
import deleteReview from "@/libs/deleteReview"
import { useSession } from "next-auth/react"

type Props = {
  reviewId: string
  shopId: string
  onDeleteSuccess?: () => void
}

export function ReviewMenu({ reviewId, shopId, onDeleteSuccess }: Props) {
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null)
  const [openDeleteDialog, toggleDeleteDialog] = React.useState(false)
  const { data: session } = useSession()

  const handleClickMenu = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget)
  }
  const handleCloseMenu = () => setAnchorEl(null)
  const handleClickDelete = () => {
    toggleDeleteDialog(true)
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

  return (
    <>
      <IconButton onClick={handleClickMenu}>
        <MoreVerticalIcon />
      </IconButton>
      <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleCloseMenu}>
        <MenuItem>Edit</MenuItem>
        <MenuItem onClick={handleClickDelete}>Delete</MenuItem>
      </Menu>
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
    </>
  )
}

