

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

const ActiveGiftBox = () => (
    <svg width="50" height="50" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-primary drop-shadow-lg">
        {/* Sparkles */}
        <path d="M50 10L52.5359 20.5359L63.0718 23.0718L52.5359 25.6077L50 36.1436L47.4641 25.6077L36.9282 23.0718L47.4641 20.5359L50 10Z" fill="url(#sparkle1)" />
        <path d="M20 25L21.768 32.268L29 35L21.768 37.732L20 45L18.232 37.732L11 35L18.232 32.268L20 25Z" fill="url(#sparkle2)" />
        <path d="M80 50L81.768 57.268L89 60L81.768 62.732L80 70L78.232 62.732L71 60L78.232 57.268L80 50Z" fill="url(#sparkle3)" />
        
        {/* Gift Box */}
        <rect x="25" y="46.5" width="50" height="25" rx="2" fill="url(#box-bottom)"/>
        <path d="M50 46.5V71.5" stroke="white" strokeWidth="3" strokeLinecap="round"/>
        <rect x="25" y="31.5" width="50" height="15" rx="2" fill="url(#box-top)"/>
        <path d="M34.5 31.5H65.5" stroke="hsl(var(--primary))" strokeWidth="3" strokeLinecap="round"/>
        <path d="M50 8.5C41.4396 8.5 34.5 15.4396 34.5 24V31.5H50V8.5Z" fill="url(#ribbon-left)"/>
        <path d="M50 8.5C58.5604 8.5 65.5 15.4396 65.5 24V31.5H50V8.5Z" fill="url(#ribbon-right)"/>
        
        <defs>
            <linearGradient id="box-bottom" x1="50" y1="46.5" x2="50" y2="71.5" gradientUnits="userSpaceOnUse"><stop stopColor="hsl(var(--primary))" stopOpacity="0.8"/><stop offset="1" stopColor="hsl(var(--primary))"/></linearGradient>
            <linearGradient id="box-top" x1="50" y1="31.5" x2="50" y2="46.5" gradientUnits="userSpaceOnUse"><stop stopColor="hsl(var(--primary))" stopOpacity="0.7"/><stop offset="1" stopColor="hsl(var(--primary))" stopOpacity="0.9"/></linearGradient>
            <linearGradient id="ribbon-left" x1="42.25" y1="8.5" x2="42.25" y2="31.5" gradientUnits="userSpaceOnUse"><stop stopColor="hsl(var(--primary))"/><stop offset="1" stopColor="hsl(var(--primary))" stopOpacity="0.5"/></linearGradient>
            <linearGradient id="ribbon-right" x1="57.75" y1="8.5" x2="57.75" y2="31.5" gradientUnits="userSpaceOnUse"><stop stopColor="hsl(var(--primary))"/><stop offset="1" stopColor="hsl(var(--primary))" stopOpacity="0.5"/></linearGradient>
            <radialGradient id="sparkle1" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(50 23.0718) rotate(90) scale(13.0718)"><stop stopColor="hsl(var(--primary))"/><stop offset="1" stopColor="hsl(var(--primary))" stopOpacity="0"/></radialGradient>
            <radialGradient id="sparkle2" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(20 35) rotate(90) scale(10)"><stop stopColor="hsl(var(--primary))"/><stop offset="1" stopColor="hsl(var(--primary))" stopOpacity="0"/></radialGradient>
            <radialGradient id="sparkle3" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(80 60) rotate(90) scale(10)"><stop stopColor="hsl(var(--primary))"/><stop offset="1" stopColor="hsl(var(--primary))" stopOpacity="0"/></radialGradient>
        </defs>
    </svg>
);


const LockedGiftBox = ({ className }: { className?: string }) => (
    <svg width="32" height="32" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" className={cn("text-muted-foreground/30", className)}>
        <path d="M10 18C10 15.7909 11.7909 14 14 14H26C28.2091 14 30 15.7909 30 18V28H10V18Z" fill="currentColor"/>
        <path d="M16 14V11C16 8.79086 17.7909 7 20 7C22.2091 7 24 8.79086 24 11V14" stroke="currentColor" strokeWidth="4" strokeLinecap="round"/>
        <rect x="8" y="28" width="24" height="5" rx="1" fill="currentColor"/>
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
        const wasUnlocked = ref.current?.dataset.unlocked === 'true';
        if (isUnlocked && !wasUnlocked) {
            onUnlock();
            if (ref.current) {
                ref.current.dataset.unlocked = 'true';
            }
        } else if (!isUnlocked && wasUnlocked) {
            if (ref.current) {
                ref.current.dataset.unlocked = 'false';
            }
        }
    }, [isUnlocked, onUnlock]);

    return (
        <div className="flex flex-col items-center text-center w-24">
            <div className="h-12 flex items-center justify-center" ref={ref} data-unlocked="false">
                {isUnlocked ? <ActiveGiftBox /> : <LockedGiftBox />}
            </div>
            <div className="mt-2 h-14 flex flex-col items-center">
                <p className="text-sm font-semibold">
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
  }, []);

  useEffect(() => {
    const newUnlocked = milestones.map(m => currentValue >= m.threshold);
    if (JSON.stringify(newUnlocked) !== JSON.stringify(unlocked)) {
        setUnlocked(newUnlocked);
    }
  }, [currentValue, unlocked]);

  const progressPercentage = useMemo(() => {
    const highestThreshold = milestones[milestones.length - 1].threshold;
    return Math.min((currentValue / highestThreshold) * 100, 100);
  }, [currentValue]);


  const highestUnlockedIndex = unlocked.lastIndexOf(true);
  const nextMilestone = milestones[highestUnlockedIndex + 1];
  const amountNeeded = nextMilestone ? nextMilestone.threshold - currentValue : 0;

  return (
    <div className="w-full">
       {showConfetti && (
        <ReactConfetti
          width={width}
          height={height}
          recycle={false}
          numberOfPieces={400}
          gravity={0.12}
          run={showConfetti}
          onConfettiComplete={() => setShowConfetti(false)}
          tweenDuration={1500}
          style={{ position: 'fixed', top: 0, left: 0, zIndex: 1000 }}
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
                <div className="flex-1 h-px bg-muted-foreground/30 mt-5 border-t-2 border-dashed" />
              )}
            </React.Fragment>
          );
        })}
      </div>

       <div className="text-center text-sm font-medium mt-2">
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

