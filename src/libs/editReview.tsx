export default async function editReview(
    {
      token,
      shopId,
      reviewId,
      updatedData,
    }: {
      token: string;
      shopId: string;
      reviewId: string;
      updatedData: {
        header?: string;
        comment?: string;
        rating?: number;
        edited: string;
      };
    }
  ) {
    const response = await fetch(
      `${process.env.BACKEND_URL}/api/v1/shops/${shopId}/reviews/${reviewId}`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(updatedData),
      }
    );
  
    if (!response.ok) {
      let errorMessage = `Something went wrong editing the review: ${response.statusText}`;
      try {
        const errorData = await response.json();
        if (errorData?.message) {
          errorMessage = errorData.message;
        }
      } catch (_) {
        // No-op if error response can't be parsed
      }
      throw new Error(errorMessage);
    }
  
    const contentType = response.headers.get("content-type");
    if (contentType?.includes("application/json")) {
      return await response.json();
    } else {
      return { success: true, message: "Review edited successfully" };
    }
  }
  