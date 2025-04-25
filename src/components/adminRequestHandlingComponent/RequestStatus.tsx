'use client'

import React, { useState, useEffect } from 'react'
import { Box, Typography, CircularProgress } from '@mui/material'

export default function RequestStatus({ requestId }: { requestId: string }) {
  const [request, setRequest] = useState<any | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchRequestData = async () => {
      try {
        const response = await fetch(`/api/v1/requests/${requestId}`)
        const data = await response.json()
        setRequest(data.data)
      } catch (error) {
        console.error("Error fetching request data:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchRequestData()
  }, [requestId])

  if (loading) {
    return <CircularProgress />
  }

  return (
    <Box>
      {request && (
        <Box display="flex" alignItems="center">
          {/* Render Status Color */}
          <Box
            sx={{
              width: 12,
              height: 12,
              borderRadius: '50%',
              backgroundColor:
                request.status === 'pending'
                  ? 'yellow'
                  : request.status === 'approved'
                  ? 'green'
                  : 'red',
              mr: 1,
            }}
          />
          {/* Render Status Text */}
          <Typography variant="body2">
            {request.status === 'pending'
              ? 'Pending'
              : request.status === 'approved'
              ? 'Approved'
              : 'Rejected'}
          </Typography>
        </Box>
      )}
    </Box>
  )
}
