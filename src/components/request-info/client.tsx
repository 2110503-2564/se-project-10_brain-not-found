'use client'

import { Card, CardActionArea, CardContent, CardHeader, Collapse, Typography } from "@mui/material"
import { useState } from "react";

export function ServiceCard({service} : {service: Service}) {
    const [expanded, setExpanded] = useState(false);
    return (
        <Card>
            <CardActionArea onClick={()=>{setExpanded(!expanded)}}>
                <CardContent>
                    <Typography variant="body1" component="h4">{service.name}</Typography>
                </CardContent>
            </CardActionArea>
                <Collapse in={expanded}>
                    <CardContent>
                    <Typography variant="body2">Description: {service.desc} </Typography>
                    <Typography variant="body2">Price: {service.price} </Typography>
                    <Typography variant="body2">Duration: {service.duration} </Typography>
                    </CardContent>
                </Collapse>
        </Card>
    )
}