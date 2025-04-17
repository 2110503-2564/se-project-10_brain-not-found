import { Avatar, Box, Grid, IconButton, Pagination, Rating, Skeleton, Stack, Typography } from "@mui/material";
import { grey } from "@mui/material/colors";
import { ReviewMenu } from "./ReviewClient";

export function ReviewSection({shopId} : {shopId: string}) {
    
    return (
        <>
        <Stack spacing={4}>
            <Typography variant="h5" component="h2" sx={{ fontWeight:'bold' }}>Reviews</Typography>
            <ReviewList page={1}/>
            <ReviewSkeleton/>
            {/* TODO: Implement create review form */}
            <Box alignSelf='center'>
                <Pagination count={3} color="primary"/> {/* TODO: Implement working pagination system */}
            </Box>
        </Stack> 
        </>
    )
}

function ReviewList({page} : {page: number}) {

    const ReviewData : Review[] = [
        {_id: "1", header: "test 1", comment: "placeholder 1", rating: 2, shop: "test1",
        user: {name:"John Doe"}, createdAt: new Date(Date.now())},
        {_id: "2", header: "test 2", comment: "placeholder 222", rating: 4, shop: "test1",
            user: {name:"Jane Doe"}, createdAt: new Date(Date.now())},
        {_id: "3", header: "test 3", comment: "AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA", rating: 5, shop: "test1",
            user: {name:"John Cena"}, createdAt: new Date(Date.now())},
    ]

    if (ReviewData.length === 0) {
        return (
            <>
            <Typography variant="h6" sx={{ color: grey[500] }}>No reviews found</Typography>
            </>
        )
    } 

    return (
        <>
        {ReviewData.map((review) => ( <ReviewCard data={review} key={review._id}/>))}
        </>
    )
}

function ReviewCard({data} : {data: Review}) {

    const date = data.createdAt.toLocaleString();
    return (
        <>
        <Stack spacing={1} sx={{ overflowWrap: 'break-word' }}>

            <Stack direction='row' spacing={2} width='75%'>
                <Avatar sx={{ width: 50, height: 50 }}/>
                <Stack flexGrow='1'>
                    <Rating value={data.rating} readOnly/>
                    <Stack direction='row' spacing={1} alignItems='baseline' flexWrap='wrap'>
                        <Typography variant="h6" sx={{fontWeight: 'semi-bold'}}>{data.user.name}</Typography>
                        <Typography variant="caption" sx={{fontSize: '0.625rem'}}>{date}</Typography>
                    </Stack>    
                </Stack>
                <ReviewMenu/> {/* TODO: implement working buttons */}
            </Stack>
            
            <Typography variant="h5" component="h3" sx={{fontWeight: 'bold' }}>
                {data.header}
            </Typography>
            <Typography variant="body1" width='75%'>
                {data.comment}
            </Typography>

        </Stack>
        </>
    )
}

export function ReviewSkeleton() {
    return (
        <>
        <Stack spacing={2}>

            <Stack direction='row' spacing={2}>
                <Skeleton variant="circular" width={50} height={50}/>
                <Stack spacing={1}>
                    <Skeleton variant="rounded" width={120} height={20}/>
                    <Skeleton variant="rounded" width={250} height='1.25rem'/>   
                </Stack>
            </Stack>
            
            <Skeleton variant="rounded" width={200} height='1.5rem'/>
            <Skeleton variant="rounded" width='75%' height='6rem'/>

        </Stack>
        </>
    )
}