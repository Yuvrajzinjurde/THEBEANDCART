
"use client";

import React from "react";
import { cn } from '@/lib/utils';
import { useState, useEffect, useRef } from 'react';
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
     <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" className={cn("text-muted-foreground/30", className)}>
        <path d="M10 18C10 15.7909 11.7909 14 14 14H26C28.2091 14 30 15.7909 30 18V28H10V18Z" fill="currentColor"/>
        <path d="M16 14V11C16 8.79086 17.7909 7 20 7C22.2091 7 24 8.79086 24 11V14" stroke="currentColor" strokeWidth="3" strokeLinecap="round"/>
        <rect x="8" y="28" width="24" height="5" rx="1" fill="currentColor"/>
    </svg>
);

const UnlockedGiftBox = () => (
    <svg width="60" height="60" viewBox="0 0 60 60" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-primary drop-shadow-lg">
        <rect x="10" y="30" width="40" height="20" rx="2" fill="currentColor" />
        <path d="M18 20C18 16.6863 20.6863 14 24 14H36C39.3137 14 42 16.6863 42 20V26H18V20Z" fill="currentColor"/>
        <path d="M28 26V50" stroke="hsl(var(--background))" strokeWidth="2" strokeLinecap="round" />
        <path d="M32 26V50" stroke="hsl(var(--background))" strokeWidth="2" strokeLinecap="round" />
    </svg>
);


const Milestone = ({
    milestone,
    isUnlocked,
    isNext,
}: {
    milestone: typeof milestones[0];
    isUnlocked: boolean;
    isNext: boolean;
}) => {
    const { threshold, reward, icon: Icon } = milestone;

    return (
        <div className="flex flex-col items-center text-center w-28">
            <div className="h-16 flex items-center justify-center">
                 {isUnlocked ? <UnlockedGiftBox /> : <LockedGiftBox />}
            </div>
            <div className="mt-2 h-16 flex flex-col items-center">
                <p className="text-sm font-semibold">
                    {isUnlocked ? reward : 'Mystery Box'}
                </p>
                {isUnlocked && <Icon className="h-5 w-5 text-muted-foreground my-1" />}
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

  useEffect(() => {
    const newlyUnlockedIndex = milestones.findIndex((milestone, index) => {
      const isNowUnlocked = currentValue >= milestone.threshold;
      const wasLocked = !unlocked[index];
      return isNowUnlocked && wasLocked;
    });

    if (newlyUnlockedIndex !== -1) {
      setShowConfetti(true);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      timeoutRef.current = setTimeout(() => setShowConfetti(false), 2500); 
    }
    
    setUnlocked(milestones.map(m => currentValue >= m.threshold));

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentValue]);


  const highestUnlockedIndex = unlocked.lastIndexOf(true);
  const nextMilestone = milestones[highestUnlockedIndex + 1];
  const amountNeeded = nextMilestone ? nextMilestone.threshold - currentValue : 0;

  return (
    <div className="w-full py-4 mb-8">
       {showConfetti && (
        <ReactConfetti
          width={width}
          height={height}
          recycle={false}
          numberOfPieces={400}
          gravity={0.12}
          drawShape={drawCoin}
        />
      )}
      <div className="relative flex justify-between items-start px-8">
        {milestones.map((milestone, index) => {
          const isUnlocked = currentValue >= milestone.threshold;
          const isNext = highestUnlockedIndex === index - 1;
          
          return (
            <React.Fragment key={milestone.threshold}>
              <Milestone
                milestone={milestone}
                isUnlocked={isUnlocked}
                isNext={isNext}
              />
              {index < milestones.length - 1 && (
                <div className="flex-1 h-px bg-muted-foreground/30 mt-8 border-t-2 border-dashed" />
              )}
            </React.Fragment>
          );
        })}
      </div>

       <div className="text-center text-sm font-medium mt-4">
        {nextMilestone ? (
          <p>
            Add <span className="font-bold text-primary">₹{Math.max(0, amountNeeded).toFixed(0)}</span> more to unlock the <span className="font-semibold">{nextMilestone.reward}</span>!
          </p>
        ) : (
          <p className="font-bold text-green-600">Congratulations! You've unlocked all rewards!</p>
        )}
      </div>
    </div>
  );
}
