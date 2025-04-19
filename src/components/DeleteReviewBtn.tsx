'use client'
import deleteReview from "@/libs/deleteReview"
import getUserProfile from "@/libs/getUserProfile"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"

export default function DeleteReviewBtn({ token, shopId, reviewId, ownerId } : { token:string , shopId:string, reviewId:string, ownerId:string}) {

    const [permission, setPermission] = useState({ isAdmin: false, isOwn: false })
    const [isLoading, setIsLoading] = useState<boolean>(false)
    const router = useRouter()

    useEffect(() => {
        const check = async () => {
            try {
                const profile = await getUserProfile(token)
                setPermission({
                    isAdmin: profile.data.role === 'admin',
                    isOwn: profile.data.id === ownerId
                })
            } catch (error) {
                console.log(error)
            }
        }
        check()
    }, [])


    const handleDelete = async (e:React.MouseEvent) => {
        if (!window.confirm("Are you sure you want to delete this review?")) return
        try {
            setIsLoading(true)
            await deleteReview({token, shopId, reviewId})
            alert("Review deleted successfully!")
            router.refresh()
        } catch (error) {
            console.log(error)
        } finally {
            setIsLoading(false)
        }
    }

    if (!permission.isAdmin && !permission.isOwn) return null

    return (
        <div>
            <button onClick={handleDelete} disabled={isLoading}>
                {isLoading ? 'Deleting...' : 'Delete'}
            </button>
        </div>
    )
}