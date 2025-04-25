import { Box, Typography } from '@mui/material'

export default function RequestStatus({ statusText }: { statusText: string }) {
  return (
    <Box>
      {/* {request && ( */}
        <Box display="flex" alignItems="center">
          {/* Render Status Color */}
          <Box
            sx={{
              width: 12,
              height: 12,
              borderRadius: '50%',
              backgroundColor:
                statusText === 'pending'
                  ? 'yellow'
                  : statusText === 'approved'
                  ? 'green'
                  : 'red',
              mr: 1,
            }}
          />
          {/* Render Status Text */}
          <Typography variant="body2">
            {statusText === 'pending'
              ? 'Pending'
              : statusText === 'approved'
              ? 'Approved'
              : 'Rejected'}
          </Typography>
        </Box>
    </Box>
  )
}
