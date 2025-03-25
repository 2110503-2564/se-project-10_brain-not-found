'use client'
import { useState } from "react";
import Link from "next/link";
import Image from "next/image"; // ต้อง import Image จาก next/image

interface MassageCatalogClientProps {
  shopJsonReady: ShopJson;
}

const MassageCatalogClient: React.FC<MassageCatalogClientProps> = ({ shopJsonReady }) => {
  const [visibleCount, setVisibleCount] = useState(5); // เริ่มแสดง 4 รายการ

  const loadMore = () => {
    setVisibleCount(visibleCount + 5); // เพิ่มขึ้น 3 ทุกครั้งที่กด "View More"
  };

  return (
    <>
      <h1 className="text-4xl font-bold text-gray-800">
        Choose your preferred <span className="text-[#f59e0b]">Message Shops</span> from <span className="text-[#f59e0b]">{shopJsonReady.count}</span> options in the catalog
      </h1>

      <div className="m-5 flex flex-wrap justify-between items-stretch">
        {shopJsonReady.data.slice(0, visibleCount).map((ShopItem) => (
          <Link
            href={`/shops/${ShopItem.id}`}
            className="w-full sm:w-1/2 md:w-1/3 lg:w-1/4 xl:w-1/5 p-2 sm:p-3 md:p-4 lg:p-5"
            key={ShopItem.id}
          >
            <div className="bg-white border border-gray-200 rounded-lg shadow-md overflow-hidden flex flex-col justify-between h-full">
              {/* ใช้ Image จาก next/image */}
              <Image
                src={ShopItem.picture}
                alt={ShopItem.name}
                className="w-full h-48 object-cover"
                width={500} // กำหนดขนาดความกว้าง
                height={300} // กำหนดขนาดความสูง
                layout="intrinsic" // ใช้ layout เพื่อให้ขนาดภาพไม่ผิดเพี้ยน
              />
              <div className="p-4 flex-grow">
                <h3 className="text-xl font-semibold text-gray-800">{ShopItem.name}</h3>
                <p className="text-gray-600 mt-2">{ShopItem.desc}</p>
              </div>
              <div className="p-4 border-t border-gray-200">
                <button className="text-[#f59e0b] font-semibold hover:underline">
                  Detail
                </button>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {visibleCount < shopJsonReady.data.length && (
        <div className="text-center mt-5">
          <button
            onClick={loadMore}
            className="bg-[#f59e0b] text-white py-2 px-4 rounded-lg hover:bg-[#e36a00]"
          >
            View More
          </button>
        </div>
      )}
    </>
  );
};

export default MassageCatalogClient;
