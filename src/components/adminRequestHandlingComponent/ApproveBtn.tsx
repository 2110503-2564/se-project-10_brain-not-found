'use client'

import { Button } from "@mui/material"

interface ApproveButtonProps {
    onApprove: () => void
}

export default function ApproveButton({ onApprove }: ApproveButtonProps) {
    return (
        <Button variant="contained" color="success" onClick={onApprove}>
            Approve
        </Button>
    )
}