'use client'
import { Avatar, Box, Button, Grid, IconButton, Pagination, Rating, Skeleton, Stack, TextField, Typography } from "@mui/material";
import { grey } from "@mui/material/colors";
import { ReviewMenu } from "./ReviewClient";
import getReviews from "@/libs/getReviews";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import createReview from "@/libs/createReview";


export function ReviewSection({ shopId }: { shopId: string }) {
    const [header, setHeader] = useState("");
    const [comment, setComment] = useState("");
    const [rating, setRating] = useState<number | null>(0);
    const [submitting, setSubmitting] = useState(false);
    const [reviews, setReviews] = useState<Review[]>([]);
    const [loadingReviews, setLoadingReviews] = useState(true);
    const [refreshTrigger, setRefreshTrigger] = useState(0);
    const [page, setPage] = useState(1); // current page
    const [totalReviews, setTotalReviews] = useState(0);
    const limit = 5;
    const { data: session } = useSession();

    const handlePageChange = (event: React.ChangeEvent<unknown>, value: number) => {
      setPage(value);
    };

    const handleDelete = (id: string) => {
        setRefreshTrigger(prev => prev + 1);
      };
      

    // Load reviews
    useEffect(() => {
      const fetchReviews = async () => {
        setLoadingReviews(true);
        const data = await getReviews(shopId, page);
        setTotalReviews(data.totalReviews);

        setReviews(data.data);
        setLoadingReviews(false);
      };
      fetchReviews();
    }, [shopId, refreshTrigger, page]);

  
    const handleSubmit = async () => {
      if (!session?.user || !session.user.token || rating === null) return;
  
      setSubmitting(true);
      try {
        const result = await createReview(session.user.token, shopId, {
          header,
          comment,
          rating,
        });
  
        if (result?.success) {
          setHeader("");
          setComment("");
          setRating(0);
          alert("Review submitted successfully!");
          setRefreshTrigger(prev => prev + 1); // Refresh review list
        }
      } catch (err: any) {
        alert(err.message);
      } finally {
        setSubmitting(false);
      }
    };
    const totalPages = Math.ceil(totalReviews / limit);
    // debug
    // console.log("Total Reviews:", totalReviews);
    // console.log("Limit:", limit);
    // console.log("Calculated Page Count:", totalPages);

  
    return (
      <Stack spacing={4}>
        <Typography variant="h5" component="h2" sx={{ fontWeight: "bold" }}>
          Reviews
        </Typography>
  
        {loadingReviews ? (
          <ReviewSkeleton />
        ) : reviews.length === 0 ? (
          <Typography variant="h6" sx={{ color: grey[500] }}>
            No reviews found
          </Typography>
        ) : (
            reviews.map((review) => (
                <ReviewCard
                  data={review}
                  key={review._id}
                  shopId={shopId}
                  onDelete={handleDelete}
                  onEdit={()=> setRefreshTrigger(prev=> prev+1)}
                />
              ))
              
        )}
  
        {/* Create Review Form */}
        <Stack spacing={2} sx={{ border: "1px solid #ccc", p: 3, borderRadius: 2 }}>
          <Typography variant="h6">Write a Review</Typography>
          <Rating
            value={rating}
            onChange={(e, newValue) => setRating(newValue)}
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
          <Button
            variant="contained"
            onClick={handleSubmit}
            disabled={submitting}
          >
            {submitting ? "Submitting..." : "Submit Review"}
          </Button>
        </Stack>
  
        <Box alignSelf="center">
          <Pagination count={totalPages} page={page} onChange={handlePageChange} color="primary" />
        </Box>
      </Stack>
    );
  }

async function ReviewList({page, shopId} : {page: number, shopId: string}) {

    const reviews : ReviewJson = await getReviews(shopId, page);

    if (reviews.count === 0) {
        return (
            <>
            <Typography variant="h6" sx={{ color: grey[500] }}>No reviews found</Typography>
            </>
        )
    } 

    return (
        <>
        {reviews.data.map((review) => ( <ReviewCard data={review} key={review._id} shopId={shopId} onDelete={()=>{}} onEdit={()=>{}}/>))}
        </>
    )
}

function ReviewCard({ data, shopId, onDelete, onEdit }: { data: Review, shopId: string, onDelete: (id: string) => void, onEdit: ()=> void }) {
    const createdDate = new Date(data.createdAt).toLocaleString(undefined, { hour12: false });
    const editedDate = data.edited ? new Date(data.edited).toLocaleString(undefined, { hour12: false }) : undefined;
    const date = editedDate ? `${createdDate} (edited: ${editedDate})` : createdDate;
  
    return (
      <Stack spacing={1} sx={{ overflowWrap: 'break-word' }}>
        <Stack direction='row' spacing={2} width='75%'>
          <Avatar sx={{ width: 50, height: 50 }} />
          <Stack flexGrow='1'>
            <Rating value={data.rating} readOnly />
            <Stack direction='row' spacing={1} alignItems='baseline' flexWrap='wrap'>
              <Typography variant="h6" sx={{ fontWeight: 'semi-bold' }}>{data.user.name}</Typography>
              <Typography variant="caption" sx={{ fontSize: '0.625rem' }}>{date}</Typography>
            </Stack>
          </Stack>
          <ReviewMenu
            reviewId={data._id}
            shopId={shopId}
            onDeleteSuccess={() => onDelete(data._id)}
            onEditSuccess={onEdit}
            currentRating={data.rating}
            currentHeader={data.header}
            currentComment={data.comment}
          />
        </Stack>
  
        <Typography variant="h5" component="h3" sx={{ fontWeight: 'bold' }}>
          {data.header}
        </Typography>
        <Typography variant="body1" width='75%'>
          {data.comment}
        </Typography>
      </Stack>
    );
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