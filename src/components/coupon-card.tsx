
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
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        navigator.clipboard.writeText(code);
        toast.success(`Coupon code "${code}" copied to clipboard!`);
      }}
      className="flex items-stretch rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer max-w-sm mx-auto group bg-background"
    >
      {/* Main color section */}
      <div className="flex-1 bg-gradient-to-r from-pink-500 to-purple-600 text-white p-6 rounded-l-xl flex flex-col justify-center">
        <div className="flex items-center gap-2 mb-2">
          <TicketPercent className="h-5 w-5" />
          <h3 className="text-lg font-bold uppercase tracking-wide">{title}</h3>
        </div>
        <p className="text-sm opacity-90 mb-4 h-12">{description}</p>
        <button 
          className="w-full bg-white/20 text-white font-mono text-base tracking-widest py-2 px-4 rounded-lg border-2 border-dashed border-white/50 hover:bg-white/30 transition-colors"
        >
          {code}
        </button>
      </div>
      
      {/* Stub section */}
      <div className="w-20 bg-background flex flex-col items-center justify-center p-2 rounded-r-xl border-l-2 border-dashed border-gray-300 relative">
         <div className="absolute -left-[9px] top-1/2 -translate-y-1/2 h-full w-4">
            <div className="h-full w-full bg-background relative">
                 <div className="absolute -top-3 left-1/2 -translate-x-1/2 h-6 w-6 rounded-full bg-background border-r-2 border-dashed border-gray-300"></div>
                 <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 h-6 w-6 rounded-full bg-background border-r-2 border-dashed border-gray-300"></div>
            </div>
        </div>
        <p className="font-bold text-sm text-gray-500 transform -rotate-90 whitespace-nowrap tracking-[0.2em] group-hover:scale-105 transition-transform">
          COUPON
        </p>
      </div>
    </div>
  );
};
