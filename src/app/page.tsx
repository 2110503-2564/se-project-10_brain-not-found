"use client"
import { Suspense, useState } from "react";
import Banner from "@/components/Banner";
import VlogCard from "@/components/VlogCard";
import Footer from "@/components/Footer";
import LinearProgress from "@mui/material/LinearProgress"; // ใช้ MUI LinearProgress

export default function Home() {
  const massageTypes = [
    {
      title: "Foot Massage",
      description: "A relaxing massage focused on the feet to improve circulation and relieve tension.",
      img: "/img/Service/service3.jpg",
    },
    {
      title: "Swedish Massage",
      description: "A gentle, full-body massage that promotes relaxation and improves circulation.",
      img: "/img/Service/service8.jpg",
    },
    {
      title: "Deep Tissue Massage",
      description: "A more intense massage targeting deeper layers of muscle and connective tissue to relieve chronic tension.",
      img: "/img/Service/service2.jpg",
    },
    {
      title: "Aromatherapy Massage",
      description: "A relaxing massage using aromatic essential oils to promote relaxation and emotional well-being.",
      img: "/img/Service/service1.jpg",
    },
    {
      title: "Mud Spa",
      description: "A therapeutic spa treatment using mineral-rich mud to detoxify and soothe the skin.",
      img: "/img/Service/service4.jpg",
    },
    {
      title: "Thai Massage",
      description: "A traditional Thai massage combining acupressure, yoga stretches, and deep tissue work to relax and energize the body.",
      img: "/img/Service/service9.jpg",
    },
    {
      title: "Hot Stone Massage",
      description: "A massage using smooth, heated stones placed on key points of the body to promote relaxation and alleviate muscle stiffness.",
      img: "/img/Service/service7.jpg",
    },
    {
      title: "Relaxation Massage",
      description: "A soothing massage designed to relieve stress and improve overall mental and physical well-being.",
      img: "/img/Service/service5.jpg",
    },
    {
      title: "Sports Massage",
      description: "A massage designed to alleviate the aches and pains caused by sports-related injuries or activities, enhancing flexibility and recovery.",
      img: "/img/Service/service6.jpg",
    },
  ];

  const [visibleCount, setVisibleCount] = useState(3); // เริ่มต้นให้แสดง 3 รายการแรก

  const handleViewMore = () => {
    setVisibleCount(prevCount => prevCount + 3); // เพิ่มจำนวนรายการที่จะแสดงทุกครั้งที่กดปุ่ม
  };

  return (
    <Suspense fallback={<p>Loading . . . <LinearProgress/></p>}>
      <main>
        <div className="pt-[100px] text-center">
          <h1 className="text-4xl font-bold text-gray-800">
            Relax & Rejuvenate with Our <span className="text-[#f59e0b]">Massage Reservation</span> Platform
          </h1>
          <p className="text-lg text-gray-600 mt-4">
            Book your next massage session with ease and enjoy ultimate relaxation.
          </p>
        </div>

        <div className="mt-10">
          <Banner />
        </div>

        <div className="mt-10 px-6">
          <h2 className="text-3xl font-semibold text-gray-800 text-center">Our <span className="text-[#f59e0b]">Services</span></h2>
          <p className="text-gray-600 text-center mt-2">Choose from a variety of relaxing massage therapies</p>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 mt-6">
            {massageTypes.slice(0, visibleCount).map((massage) => (
              <VlogCard key={massage.title} title={massage.title} description={massage.description} img={massage.img} />
            ))}
          </div>

          {visibleCount < massageTypes.length && (
            <div className="text-center mt-6">
              <button
                onClick={handleViewMore}
                className="text-[#f59e0b] font-semibold hover:underline"
              >
                View More
              </button>
            </div>
          )}
        </div>

        <div className="pt-[100px] text-center">
          <Footer />
        </div>
      </main>
    </Suspense>
  );
}
