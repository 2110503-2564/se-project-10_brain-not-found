// src/components/Review.tsx
'use client';
import { Avatar, Box, Button, Pagination, Rating, Skeleton, Stack, TextField, Typography, Alert } from "@mui/material"; // Added Alert
import { grey } from "@mui/material/colors";
import { ReviewMenu } from "./ReviewClient";
import getReviews from "@/libs/getReviews";
import createReview from "@/libs/createReview";
import deleteReview from "@/libs/deleteReview"; // Assuming you have this
import { useEffect, useState, useCallback } from "react"; // Added useCallback
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation"; // For potential refresh

// Define Review type if not already globally available
// interface Review { ... }
// interface ReviewJson { data: Review[]; count: number; pagination?: { totalPages?: number }; }

export function ReviewSection({ shopId }: { shopId: string }) {
    const { data: session } = useSession();
    const router = useRouter(); // Or use refreshTrigger
    const [deleteError, setDeleteError] = useState<string | null>(null);
    const [deleteSuccess, setDeleteSuccess] = useState<string | null>(null); // Optional success message

    // Form State
    const [header, setHeader] = useState("");
    const [comment, setComment] = useState("");
    const [rating, setRating] = useState<number | null>(null); // Initial state null
    const [submitting, setSubmitting] = useState(false);
    const [formError, setFormError] = useState<string | null>(null);
    const [formSuccess, setFormSuccess] = useState<string | null>(null);

    // Review List State
    const [reviews, setReviews] = useState<Review[]>([]);
    const [loadingReviews, setLoadingReviews] = useState(true);
    const [fetchError, setFetchError] = useState<string | null>(null);
    const [refreshTrigger, setRefreshTrigger] = useState(0);

    // Pagination State
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    // Fetch Reviews Function
    const fetchReviews = useCallback(async (page: number) => {
        setLoadingReviews(true);
        setFetchError(null);
        try {
            const data: ReviewJson = await getReviews(shopId, page);
            setReviews(data.data);
            // Assuming API returns total pages or count to calculate it
            const calculatedTotalPages = data.pagination?.totalPages || Math.ceil(data.count / 10) || 1; // Adjust '10' based on items per page
            setTotalPages(calculatedTotalPages);
        } catch (err: any) {
            console.error("Failed to fetch reviews:", err);
            setFetchError(err.message || "Could not load reviews.");
            setReviews([]); // Clear reviews on error
        } finally {
            setLoadingReviews(false);
        }
    }, [shopId]); // useCallback depends on shopId

    // Load reviews effect
    useEffect(() => {
        fetchReviews(currentPage);
    }, [shopId, currentPage, refreshTrigger, fetchReviews]); // Include fetchReviews

    // Handle Form Submission
    const handleSubmit = async () => {
        // Clear previous messages
        setFormError(null);
        setFormSuccess(null);

        if (!session?.user?.token) {
            setFormError("You must be logged in to submit a review.");
            return;
        }
        if (rating === null || rating === 0) { // Check for null or 0 if 0 isn't valid
             setFormError("Please provide a rating.");
             return;
        }
        if (!header.trim()) {
            setFormError("Please provide a review title.");
            return;
        }
         if (!comment.trim()) {
            setFormError("Please provide a review comment.");
            return;
        }

        setSubmitting(true);
        try {
            // Assuming createReview is updated to not use alert and return consistently
            const result = await createReview(session.user.token, shopId, {
                header,
                comment,
                rating,
            });

            // Check the actual response structure from your updated createReview
            if (result?.success) {
                setHeader("");
                setComment("");
                setRating(null); // Reset to null
                setFormSuccess("Review submitted successfully!");
                setRefreshTrigger(prev => prev + 1); // Refresh review list
            } else {
                 // Use message from API response if available
                setFormError(result?.message || "Failed to submit review.");
            }
        } catch (err: any) {
            console.error("Error submitting review:", err);
            setFormError(err.message || "An unexpected error occurred.");
        } finally {
            setSubmitting(false);
        }
    };

    // Handle Review Deletion
    const handleDelete = async (reviewId: string) => {
        setDeleteError(null); // Clear previous errors
        setDeleteSuccess(null); // Clear previous success messages
    
        if (!session?.user?.token) {
            setDeleteError("Authentication error. Please log in again.");
            return;
        }
    
        // Use the confirmation dialog from ReviewMenu, no need for window.confirm here
        // if (!window.confirm("Are you sure you want to delete this review?")) return;
    
        try {
            await deleteReview({ token: session.user.token, shopId, reviewId });
            setDeleteSuccess("Review deleted successfully!"); // Set success message
            setRefreshTrigger(prev => prev + 1); // Refresh list
        } catch (err: any) {
            console.error("Error deleting review:", err);
            setDeleteError(`Failed to delete review: ${err.message}`); // Set error message state
        }
    };

    // Handle Pagination Change
    const handlePageChange = (event: React.ChangeEvent<unknown>, value: number) => {
        setCurrentPage(value);
        // Optional: Scroll to top of reviews section
    };

    return (
        <Stack spacing={4}>
            <Typography variant="h5" component="h2" sx={{ fontWeight: "bold" }}>
                Reviews
            </Typography>

            {loadingReviews ? (
                <ReviewSkeleton />
            ) : fetchError ? (
                 <Alert severity="error">{fetchError}</Alert>
            ) : reviews.length === 0 ? (
                <Typography variant="body1" sx={{ color: grey[600], textAlign: 'center', my: 2 }}>
                    Be the first to review this shop!
                </Typography>
            ) : (
                reviews.map((review) => (
                    <ReviewCard
                        data={review}
                        key={review._id}
                        session={session} // Pass session
                        shopId={shopId}   // Pass shopId
                        onDelete={handleDelete} // Pass delete handler
                    />
                ))
            )}

            {/* Create Review Form */}
            {session?.user && ( // Only show form if logged in
                <Stack component="form" noValidate autoComplete="off" spacing={2} sx={{ border: `1px solid ${grey[300]}`, p: 3, borderRadius: 2, mt: 4 }}>
                    <Typography variant="h6">Write a Review</Typography>
                    {formError && <Alert severity="error" onClose={() => setFormError(null)}>{formError}</Alert>}
                    {formSuccess && <Alert severity="success" onClose={() => setFormSuccess(null)}>{formSuccess}</Alert>}
                    <Box>
                        <Typography component="legend">Your Rating*</Typography>
                        <Rating
                            name="review-rating"
                            value={rating}
                            onChange={(event, newValue) => {
                                setRating(newValue);
                                if (formError) setFormError(null); // Clear error on change
                            }}
                        />
                    </Box>
                    <TextField
                        label="Title*"
                        value={header}
                        onChange={(e) => {
                            setHeader(e.target.value);
                             if (formError) setFormError(null);
                        }}
                        fullWidth
                        required
                    />
                    <TextField
                        label="Comment*"
                        value={comment}
                        onChange={(e) => {
                            setComment(e.target.value);
                             if (formError) setFormError(null);
                        }}
                        fullWidth
                        multiline
                        minRows={3}
                        required
                    />
                    <Button
                        variant="contained"
                        onClick={handleSubmit}
                        disabled={submitting || !rating} // Also disable if no rating
                        sx={{ alignSelf: 'flex-start' }}
                    >
                        {submitting ? "Submitting..." : "Submit Review"}
                    </Button>
                </Stack>
            )}
             {!session?.user && (
                 <Typography sx={{ color: grey[600], textAlign: 'center', my: 2 }}>
                     Please log in to write a review.
                 </Typography>
             )}

            {/* Pagination */}
            {totalPages > 1 && (
                <Box display="flex" justifyContent="center" sx={{ mt: 3 }}>
                    <Pagination
                        count={totalPages}
                        page={currentPage}
                        onChange={handlePageChange}
                        color="primary"
                    />
                </Box>
            )}
        </Stack>
    );
}


// --- ReviewCard (Updated to accept props) ---
function ReviewCard({ data, session, shopId, onDelete }: {
    data: Review;
    session: ReturnType<typeof useSession>['data'];
    shopId: string;
    onDelete: (reviewId: string) => Promise<void>; // Or appropriate type
}) {
    const createdDate = new Date(data.createdAt).toLocaleString(undefined, { hour12: false });
    const editedDate = data.edited ? new Date(data.edited).toLocaleString(undefined, { hour12: false }) : undefined;
    const date = editedDate ? `${createdDate} (edited: ${editedDate})` : createdDate;

    return (
        <Stack spacing={1.5} sx={{ overflowWrap: 'break-word', borderBottom: `1px solid ${grey[200]}`, pb: 2 }}>
            <Stack direction='row' spacing={2} alignItems="flex-start"> {/* Use flex-start */}
                <Avatar sx={{ width: 50, height: 50, mt: 0.5 }} /> {/* Adjust alignment */}
                <Stack flexGrow='1'>
                    <Rating value={data.rating} readOnly size="small" sx={{ mb: 0.5 }} />
                    <Stack direction='row' spacing={1} alignItems='baseline' flexWrap='wrap'>
                        <Typography variant="h6" sx={{ fontWeight: '600', lineHeight: 1.3 }}>{data.user.name}</Typography> {/* Use 600 for semi-bold */}
                        <Typography variant="caption" sx={{ fontSize: '0.75rem', color: grey[600] }}>{date}</Typography>
                    </Stack>
                </Stack>
                {/* Pass props to ReviewMenu */}
                <ReviewMenu
                    session={session}
                    shopId={shopId}
                    reviewId={data._id}
                    ownerId={data.user._id} // Assuming user object has _id
                    onDelete={onDelete}
                />
            </Stack>

            <Typography variant="h5" component="h3" sx={{ fontWeight: 'bold', mt: 1 }}>
                {data.header}
            </Typography>
            <Typography variant="body1" sx={{ color: grey[800] }}> {/* Removed fixed width */}
                {data.comment}
            </Typography>
        </Stack>
    );
}

// --- ReviewSkeleton (Keep as is or refine styles) ---
export function ReviewSkeleton() {
    // ... your existing skeleton code ...
     return (
        <>
        <Stack spacing={4}> {/* Increase spacing */}
            {[...Array(2)].map((_, index) => ( // Simulate 2 skeleton reviews
                <Stack spacing={2} key={index} sx={{ borderBottom: `1px solid ${grey[200]}`, pb: 2 }}>
                    <Stack direction='row' spacing={2} alignItems="flex-start">
                        <Skeleton variant="circular" width={50} height={50} sx={{ mt: 1 }} />
                        <Stack flexGrow='1' spacing={1}>
                            <Skeleton variant="rounded" width={100} height={18} />
                            <Skeleton variant="text" width={200} height={20} />
                            <Skeleton variant="text" width={150} height={15} />
                        </Stack>
                    </Stack>
                    <Skeleton variant="text" width="40%" height={30} sx={{ mt: 1 }} />
                    <Skeleton variant="rounded" width='90%' height='4rem' />
                </Stack>
            ))}
             <Box display="flex" justifyContent="center" sx={{ mt: 3 }}>
                <Skeleton variant="rounded" width={200} height={36} />
            </Box>
        </Stack>
        </>
    )
}
