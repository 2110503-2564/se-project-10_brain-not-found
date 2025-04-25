'use client'

import { Button } from "@mui/material"

interface RejectButtonProps {
    onReject: () => void
}

export default function RejectButton({ onReject }: RejectButtonProps) {
    return (
        <Button variant="contained" color="error" onClick={onReject}>
            Reject
        </Button>
    )
}
