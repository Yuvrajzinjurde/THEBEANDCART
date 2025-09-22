
'use client';

import { TicketPercent } from 'lucide-react';
import { toast } from 'react-toastify';
import { cn } from '@/lib/utils';

interface CouponCardProps {
  code: string;
  description: string;
  title: string;
  className?: string;
}

export const CouponCard = ({ code, description, title, className }: CouponCardProps) => {

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
      className={cn(
        "relative flex rounded-xl shadow-md hover:shadow-lg transition-all duration-300 cursor-pointer bg-card overflow-hidden group",
        className
      )}
    >
      {/* Main color section */}
      <div className="flex-1 bg-gradient-to-br from-primary/90 to-primary/70 text-primary-foreground p-5 flex flex-col justify-center">
        <div className="flex items-center gap-2 mb-2">
          <TicketPercent className="h-5 w-5" />
          <h3 className="text-lg font-bold uppercase tracking-wide">{title}</h3>
        </div>
        <p className="text-sm opacity-90 mb-4 h-12">{description}</p>
        <button 
          onClick={handleCopyCode}
          className="w-full bg-white/20 text-white font-mono text-base tracking-widest py-2 px-4 rounded-lg border-2 border-dashed border-white/50 hover:bg-white/30 transition-colors"
        >
          {code}
        </button>
      </div>
      
      {/* Stub section */}
      <div className="w-16 bg-card flex flex-col items-center justify-center p-2 border-l-2 border-dashed border-border relative">
         <div className="absolute -left-3 top-1/2 -translate-y-1/2 h-6 w-6 rounded-full bg-card-foreground/5"></div>
         <div className="absolute -left-[13px] top-1/4 -translate-y-1/2 h-6 w-6 rounded-full bg-background"></div>
         <div className="absolute -left-[13px] bottom-1/4 translate-y-1/2 h-6 w-6 rounded-full bg-background"></div>

        <p className="font-bold text-sm text-muted-foreground/80 transform -rotate-90 whitespace-nowrap tracking-[0.2em] group-hover:scale-105 transition-transform">
          COUPON
        </p>
      </div>
    </div>
  );
};
