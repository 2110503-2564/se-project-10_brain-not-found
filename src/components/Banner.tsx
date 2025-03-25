'use client'
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { useSession } from 'next-auth/react';
import { motion, AnimatePresence } from 'framer-motion';

export default function Banner() {
    const covers = [
        "/img/forBanner/massage1.jpg", 
        "/img/forBanner/massage2.jpg", 
        "/img/forBanner/massage3.jpg",
        "/img/forBanner/massage4.jpg",
        "/img/forBanner/massage5.jpg",
        "/img/forBanner/massage6.jpg",
    ];
    const [index, setIndex] = useState(0);
    const [isHovered, setIsHovered] = useState(false);
    const router = useRouter();
    const { data: session } = useSession();

    if (session && session.user) {
        console.log(session.user.token);
    } else {
        console.log("No session or user data available.");
    }

    const changeImage = (direction: number) => {
        setIndex((prevIndex) => (prevIndex + direction + covers.length) % covers.length);
    };

    return (
        <div 
            className="relative w-full h-[500px] flex justify-center overflow-hidden"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            {/* ใช้ AnimatePresence เพื่อให้ Transition ลื่นไหลขึ้น */}
            <AnimatePresence mode="wait">
                <motion.div
                    key={index}
                    initial={{ opacity: 0, x: 100 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -100 }}
                    transition={{ type: "spring", stiffness: 100, damping: 20 }}
                    className="absolute w-full h-full"
                >
                    <Image 
                        src={covers[index]} 
                        alt="Banner picture"
                        fill={true}
                        className="object-cover"
                    />
                </motion.div>
            </AnimatePresence>

            {/* ปุ่มเลื่อนซ้าย */}
            {isHovered && (
                <button 
                    className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-3 rounded-full hover:bg-opacity-70 transition-opacity duration-300"
                    onClick={() => changeImage(-1)}
                >
                    ←
                </button>
            )}

            {/* ปุ่มเลื่อนขวา */}
            {isHovered && (
                <button 
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-3 rounded-full hover:bg-opacity-70 transition-opacity duration-300"
                    onClick={() => changeImage(1)}
                >
                    →
                </button>
            )}
        </div>
    );
}
