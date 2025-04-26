"use client";

import { ExpandLess, ExpandMore } from "@mui/icons-material";
import {
  Badge,
  Button,
  Card,
  CardActionArea,
  CardContent,
  CardHeader,
  Collapse,
  Divider,
  Popover,
  Typography,
} from "@mui/material";
import { Session } from "next-auth";
import React from "react";
import { useState } from "react";

export function ServiceCard({ service }: { service: ServiceData }) {
  const [expanded, setExpanded] = useState(false);
  return (
    <Card>
      <CardActionArea
        onClick={() => {
          setExpanded(!expanded);
        }}
      >
        <CardContent sx={{ display: "flex", flexGrow: 1 }}>
          <Typography variant="body1" component="h4" width="95%">
            {service.name}
          </Typography>
          {expanded ? <ExpandLess /> : <ExpandMore />}
        </CardContent>
        <Collapse in={expanded}>
          <Divider />
          <CardContent>
            <Typography variant="body2">
              Description: {service.desc}{" "}
            </Typography>
            <Typography variant="body2">Price: {service.price} </Typography>
            <Typography variant="body2">
              Duration: {service.duration}{" "}
            </Typography>
          </CardContent>
        </Collapse>
      </CardActionArea>
    </Card>
  );
}

export function RequestInfoStatus({ request }: { request: RequestData }) {
  const [anchorEl, setAnchorEl] = React.useState<HTMLButtonElement | null>(
    null
  );

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const open = Boolean(anchorEl);

  if (request.status === "pending") {
    return (
      <>
        <Typography display="inline">Status: </Typography>
        <span className="border rounded-md border-gray-400 shadow-md px-2 py-1">
          <Typography variant="button" component="span" fontWeight={700}>
            Pending
          </Typography>
        </span>
      </>
    );
  } else if (request.status === "approved") {
    return (
      <>
        <Typography display="inline">Status: </Typography>
        <span className="border rounded-md bg-green-500 border-gray-400 shadow-md px-2 py-1">
          <Typography
            variant="button"
            component="span"
            fontWeight={700}
            color={"white"}
          >
            Approved
          </Typography>
        </span>
      </>
    );
  } else if (request.status === "rejected") {
    return (
      <>
        <Typography display="inline">Status: </Typography>
        <Badge color="info" badgeContent="" variant="dot">
          <Button
            color="error"
            variant="contained"
            size="small"
            sx={{ fontWeight: 700 }}
            onClick={handleClick}
          >
            Rejected
          </Button>
          <Popover
            open={open}
            anchorEl={anchorEl}
            onClose={handleClose}
            anchorOrigin={{
              vertical: "bottom",
              horizontal: "center",
            }}
            transformOrigin={{
              vertical: "top",
              horizontal: "center",
            }}
          >
            <Typography variant="body1">{request.reason}</Typography>
          </Popover>
        </Badge>
      </>
    );
  } else return <Typography variant="h6">Error: Unknown Status</Typography>;
}

export function RequestInfoButtonGroup({session, status} : {session: Session, status: string}) {
    const { role } = session.user;

    // A little unsure about the role handling logic
    // Will come back to fix this later
    // For now, rejected request can be re-edited
    // Also didn't use the provided button becaus they don't accept the status prop

    if (role === 'shopOwner') {
        return (
            <div className="flex justify-evenly w-full">
                <EditButton status={status}/>
                <DeleteButton/>
            </div>
        )
    } else if (role === 'admin') {
        return (
            <div className="flex justify-evenly w-full">
                <ApproveButton status={status}/>
                <RejectButton status={status}/>
            </div>
        )
    }
}

function EditButton({status} : {status: string}) {

    const handleClick = () => {
        return null;
    }

    return (
        <Button color="primary" variant="contained" disabled={status === 'approved'} onClick={handleClick}>
            Edit
        </Button>
    )
}

function DeleteButton() {

    const handleClick = () => {
        return null;
    }

    return (
        <Button color="error" variant="contained" onClick={handleClick}>
            Delete
        </Button>
    )
}

function ApproveButton({status} : {status: string}) {

    const handleClick = () => {
        return null;
    }

    return (
        <Button color="success" variant="contained" disabled={status !== 'pending'} onClick={handleClick}>
            Approve
        </Button>
    )
}

function RejectButton({status} : {status: string}) {

    const handleClick = () => {
        return null;
    }

    return (
        <Button color="error" variant="contained" disabled={status !== 'pending'} onClick={handleClick}>
            Reject
        </Button>
    )
}