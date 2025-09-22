
'use client';

import { TicketPercent } from 'lucide-react';
import { toast } from 'react-toastify';

interface CouponCardProps {
  code: string;
  description: string;
  title: string;
}

export const CouponCard = ({ code, description, title }: CouponCardProps) => {

  const handleCopyCode = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();
    navigator.clipboard.writeText(code);
    toast.success(`Coupon code "${code}" copied to clipboard!`);
  };

  return (
    <div
      onClick={handleCopyCode}
      className="flex items-stretch rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer max-w-sm mx-auto group"
    >
      {/* Main color section */}
      <div className="flex-1 bg-gradient-to-r from-pink-500 to-purple-600 text-white p-5 rounded-l-xl relative">
        <div className="absolute top-0 -left-2 h-full flex flex-col justify-around py-2">
            <div className="h-4 w-4 rounded-full bg-background transform -translate-x-1/2"></div>
            <div className="h-4 w-4 rounded-full bg-background transform -translate-x-1/2"></div>
        </div>
        
        <div className="flex items-center gap-2 mb-2">
          <TicketPercent className="h-6 w-6" />
          <h3 className="text-xl font-bold uppercase">{title}</h3>
        </div>
        <p className="text-sm opacity-90 mb-4">{description}</p>
        <button 
          className="w-full bg-white/20 text-white font-mono text-lg tracking-widest py-2 px-4 rounded-lg border-2 border-dashed border-white/50 hover:bg-white/30 transition-colors"
        >
          {code}
        </button>
      </div>
      
      {/* Stub section */}
      <div className="w-24 bg-white flex flex-col items-center justify-center p-2 rounded-r-xl border-l-2 border-dashed border-gray-300 relative">
        <div className="absolute top-0 -right-2 h-full flex flex-col justify-around py-2">
            <div className="h-4 w-4 rounded-full bg-background transform translate-x-1/2"></div>
            <div className="h-4 w-4 rounded-full bg-background transform translate-x-1/2"></div>
        </div>
        <p className="font-bold text-lg text-gray-700 transform -rotate-90 whitespace-nowrap group-hover:scale-105 transition-transform">
          COUPON
        </p>
      </div>
    </div>
  );
};
