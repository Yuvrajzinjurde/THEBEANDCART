
"use client";

import React, { useState, useEffect, useRef } from "react";
import { cn } from '@/lib/utils';
import ReactConfetti from 'react-confetti';
import { useWindowSize } from '@react-hook/window-size';
import { Truck, Tag, Gift } from 'lucide-react';

const milestones = [
  { threshold: 399, reward: "Free Delivery", icon: Truck },
  { threshold: 799, reward: "Extra 10% Off", icon: Tag },
  { threshold: 999, reward: "Free Gift", icon: Gift },
];

const drawCoin = (ctx: CanvasRenderingContext2D) => {
    const emoji = '🪙';
    ctx.font = "24px serif";
    ctx.fillText(emoji, 0, 0);
};

const LockedGiftBox = ({ className }: { className?: string }) => (
    <svg width="24" height="24" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" className={cn("text-muted-foreground/30", className)}>
        <path d="M10 18C10 15.7909 11.7909 14 14 14H26C28.2091 14 30 15.7909 30 18V28H10V18Z" fill="currentColor"/>
        <path d="M16 14V11C16 8.79086 17.7909 7 20 7C22.2091 7 24 8.79086 24 11V14" stroke="currentColor" strokeWidth="3" strokeLinecap="round"/>
        <rect x="8" y="28" width="24" height="5" rx="1" fill="currentColor"/>
    </svg>
);


const ActiveGiftBox = () => (
    <svg width="40" height="40" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-primary drop-shadow-lg">
        {/* Sparkles */}
        <path d="M50 0L52.5359 10.5359L63.0718 13.0718L52.5359 15.6077L50 26.1436L47.4641 15.6077L36.9282 13.0718L47.4641 10.5359L50 0Z" fill="url(#paint4_radial_1_2)" />
        <path d="M15 20L16.768 27.268L24 30L16.768 32.732L15 40L13.232 32.732L6 30L13.232 27.268L15 20Z" fill="url(#paint5_radial_1_2)" />
        <path d="M85 45L86.768 52.268L94 55L86.768 57.732L85 65L83.232 57.732L76 55L83.232 52.268L85 45Z" fill="url(#paint6_radial_1_2)" />
        {/* Gift Box */}
        <rect x="25" y="41.5" width="50" height="25" rx="2" fill="url(#paint0_linear_1_2)"/>
        <path d="M50 41.5V66.5" stroke="white" strokeWidth="3" strokeLinecap="round"/>
        <rect x="25" y="26.5" width="50" height="15" rx="2" fill="url(#paint1_linear_1_2)"/>
        <path d="M34.5 26.5H65.5" stroke="hsl(var(--primary))" strokeWidth="3" strokeLinecap="round"/>
        <path d="M50 3.5C41.4396 3.5 34.5 10.4396 34.5 19V26.5H50V3.5Z" fill="url(#paint2_linear_1_2)"/>
        <path d="M50 3.5C58.5604 3.5 65.5 10.4396 65.5 19V26.5H50V3.5Z" fill="url(#paint3_linear_1_2)"/>
        <path d="M26.216 67.8927C44.7838 88.0315 70.1651 86.9452 79.7997 73.5418" stroke="white" strokeWidth="3" strokeLinecap="round"/>
        <path d="M92 21.5L88.5 25L92 28.5L88.5 32" stroke="hsl(var(--primary))" strokeWidth="3" strokeLinecap="round"/>
        <defs>
            <linearGradient id="paint0_linear_1_2" x1="50" y1="41.5" x2="50" y2="66.5" gradientUnits="userSpaceOnUse"><stop stopColor="hsl(var(--primary))" stopOpacity="0.8"/><stop offset="1" stopColor="hsl(var(--primary))"/></linearGradient>
            <linearGradient id="paint1_linear_1_2" x1="50" y1="26.5" x2="50" y2="41.5" gradientUnits="userSpaceOnUse"><stop stopColor="hsl(var(--primary))" stopOpacity="0.7"/><stop offset="1" stopColor="hsl(var(--primary))" stopOpacity="0.9"/></linearGradient>
            <linearGradient id="paint2_linear_1_2" x1="42.25" y1="3.5" x2="42.25" y2="26.5" gradientUnits="userSpaceOnUse"><stop stopColor="hsl(var(--primary))"/><stop offset="1" stopColor="hsl(var(--primary))" stopOpacity="0.5"/></linearGradient>
            <linearGradient id="paint3_linear_1_2" x1="57.75" y1="3.5" x2="57.75" y2="26.5" gradientUnits="userSpaceOnUse"><stop stopColor="hsl(var(--primary))"/><stop offset="1" stopColor="hsl(var(--primary))" stopOpacity="0.5"/></linearGradient>
            <radialGradient id="paint4_radial_1_2" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(50 13.0718) rotate(90) scale(13.0718)"><stop stopColor="hsl(var(--primary))"/><stop offset="1" stopColor="hsl(var(--primary))" stopOpacity="0"/></radialGradient>
            <radialGradient id="paint5_radial_1_2" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(15 30) rotate(90) scale(10)"><stop stopColor="hsl(var(--primary))"/><stop offset="1" stopColor="hsl(var(--primary))" stopOpacity="0"/></radialGradient>
            <radialGradient id="paint6_radial_1_2" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(85 55) rotate(90) scale(10)"><stop stopColor="hsl(var(--primary))"/><stop offset="1" stopColor="hsl(var(--primary))" stopOpacity="0"/></radialGradient>
        </defs>
    </svg>
);

const Milestone = ({
    milestone,
    isUnlocked,
    onUnlock,
}: {
    milestone: typeof milestones[0];
    isUnlocked: boolean;
    onUnlock: () => void;
}) => {
    const { threshold, reward, icon: Icon } = milestone;
    const ref = React.useRef<HTMLDivElement>(null);

    React.useEffect(() => {
        if (isUnlocked) {
            onUnlock();
        }
    }, [isUnlocked, onUnlock]);

    return (
        <div className="flex flex-col items-center text-center w-20">
            <div className="h-10 flex items-center justify-center" ref={ref}>
                {isUnlocked ? <ActiveGiftBox /> : <LockedGiftBox />}
            </div>
            <div className="mt-2 h-12 flex flex-col items-center">
                <p className="text-xs font-semibold">
                    {isUnlocked ? reward : 'Mystery Box'}
                </p>
                {isUnlocked && <Icon className="h-4 w-4 text-muted-foreground my-1" />}
                 <p className="text-xs text-muted-foreground font-medium mt-auto">
                    ₹{threshold}
                </p>
            </div>
        </div>
    );
};


export function CartProgressBar({ currentValue }: { currentValue: number }) {
  const { width, height } = useWindowSize();
  const [unlocked, setUnlocked] = useState<boolean[]>(milestones.map(m => currentValue >= m.threshold));
  const [showConfetti, setShowConfetti] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleUnlock = React.useCallback(() => {
    setShowConfetti(true);
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => setShowConfetti(false), 1500); 
  }, []);

  useEffect(() => {
    const newUnlocked = milestones.map(m => currentValue >= m.threshold);
    if (JSON.stringify(newUnlocked) !== JSON.stringify(unlocked)) {
        setUnlocked(newUnlocked);
    }
  }, [currentValue, unlocked]);


  const highestUnlockedIndex = unlocked.lastIndexOf(true);
  const nextMilestone = milestones[highestUnlockedIndex + 1];
  const amountNeeded = nextMilestone ? nextMilestone.threshold - currentValue : 0;

  return (
    <div className="w-full max-w-lg">
       {showConfetti && (
        <ReactConfetti
          width={width}
          height={height}
          recycle={false}
          numberOfPieces={400}
          gravity={0.12}
          drawShape={drawCoin}
          tweenDuration={1500}
        />
      )}
      <div className="relative flex justify-between items-start px-4">
        {milestones.map((milestone, index) => {
          const isUnlocked = currentValue >= milestone.threshold;
          
          return (
            <React.Fragment key={milestone.threshold}>
              <Milestone
                milestone={milestone}
                isUnlocked={isUnlocked}
                onUnlock={handleUnlock}
              />
              {index < milestones.length - 1 && (
                <div className="flex-1 h-px bg-muted-foreground/30 mt-4 border-t-2 border-dashed" />
              )}
            </React.Fragment>
          );
        })}
      </div>

       <div className="text-center text-sm font-medium mt-4">
        {nextMilestone ? (
          <p>
            Add <span className="font-bold text-primary">₹{Math.max(0, amountNeeded).toFixed(0)}</span> more to unlock the next reward!
          </p>
        ) : (
          <p className="font-bold text-green-600">Congratulations! You've unlocked all rewards!</p>
        )}
      </div>
    </div>
  );
}
