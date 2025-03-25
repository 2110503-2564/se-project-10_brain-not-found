import React from 'react';

interface VlogCardProps {
  title: string;
  description: string;
  img: string;
}

const VlogCard: React.FC<VlogCardProps> = ({ title, description, img }) => {
    return (
      <div className="bg-white border border-gray-200 rounded-lg shadow-md overflow-hidden flex flex-col justify-between">
        <img src={img} alt={title} className="w-full h-48 object-cover" />
        <div className="p-4 flex-grow">
          <h3 className="text-xl font-semibold text-gray-800">{title}</h3>
          <p className="text-gray-600 mt-2">{description}</p>
        </div>
      </div>
    );
  };
  
  export default VlogCard;
  
