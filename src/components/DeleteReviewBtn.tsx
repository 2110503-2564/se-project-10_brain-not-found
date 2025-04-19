'use client'
import deleteReview from "@/libs/deleteReview"
import getUserProfile from "@/libs/getUserProfile"
import { useSession } from "next-auth/react"
import {  useRouter } from "next/navigation"
import { useEffect, useState } from "react"

export default function DeleteReviewBtn({ shopId, reviewId, ownerId } : { shopId:string, reviewId:string, ownerId:string}) {

    const [permission, setPermission] = useState({ isAdmin: false, isOwn: false })
    const [isLoading, setIsLoading] = useState<boolean>(false)
    const [token, setToken] = useState('')
    const router = useRouter()
    const { data:session } = useSession()

    // ใช้ useEffect เพื่อให้ทำงานแค่ตอน session หรือข้อมูลที่เกี่ยวข้องเปลี่ยนแปลง
    useEffect(() => {
        if (session?.user && session.user.token) {
            setToken(session.user.token)
            setPermission({
                isAdmin: session.user.role === 'admin',
                isOwn: session.user._id === ownerId
            })
        }
    }, [session, ownerId]) // ทำงานเมื่อ session หรือ ownerId เปลี่ยนแปลง

    const handleDelete = async (e:React.MouseEvent) => {
        if (!window.confirm("Are you sure you want to delete this review?")) return
        try {
            setIsLoading(true)
            await deleteReview({token, shopId, reviewId})
            alert("Review deleted successfully!")
            router.push(`/shops/${shopId}`)
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