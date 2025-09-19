
"use client";

import { cn } from '@/lib/utils';
import { Card, CardContent } from './ui/card';
import { useState, useEffect, useRef } from 'react';
import ReactConfetti from 'react-confetti';
import { useWindowSize } from '@react-hook/window-size';
import { Truck, Tag, Gift } from 'lucide-react';


const milestones = [
  { threshold: 399, reward: "Free Delivery", icon: Truck },
  { threshold: 799, reward: "Extra 10% Off", icon: Tag },
  { threshold: 999, reward: "Free Gift", icon: Gift },
];

const LockedGiftBox = ({ className }: { className?: string }) => (
    <svg width="80" height="80" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className={cn("text-gray-300", className)}>
        <path d="M50 41.5C38.6853 41.5 29.5 50.6853 29.5 62V71.5H70.5V62C70.5 50.6853 61.3147 41.5 50 41.5Z" fill="currentColor"/>
        <rect x="25" y="71.5" width="50" height="5" fill="currentColor"/>
        <path d="M41 41.5C41 36.8056 44.8056 33 49.5 33V33C54.1944 33 58 36.8056 58 41.5V52.5H41V41.5Z" stroke="currentColor" strokeWidth="3"/>
    </svg>
);

const UnlockedGiftBox = ({ className }: { className?: string }) => (
    <svg width="80" height="80" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className={cn("text-primary", className)}>
        <rect y="26.5" width="100" height="15" fill="url(#paint0_linear_1_2)"/>
        <path d="M15 41.5H85V76.5C85 79.2614 82.7614 81.5 80 81.5H20C17.2386 81.5 15 79.2614 15 76.5V41.5Z" fill="url(#paint1_linear_1_2)"/>
        <path d="M50 3.5C41.4396 3.5 34.5 10.4396 34.5 19V26.5H50V3.5Z" fill="url(#paint2_linear_1_2)"/>
        <path d="M50 3.5C58.5604 3.5 65.5 10.4396 65.5 19V26.5H50V3.5Z" fill="url(#paint3_linear_1_2)"/>
        <path d="M26.216 67.8927C44.7838 88.0315 70.1651 86.9452 79.7997 73.5418" stroke="white" strokeWidth="3" strokeLinecap="round"/>
        <path d="M92 21.5L88.5 25L92 28.5L88.5 32" stroke="currentColor" strokeWidth="3" strokeLinecap="round"/>
        <defs>
            <linearGradient id="paint0_linear_1_2" x1="50" y1="26.5" x2="50" y2="41.5" gradientUnits="userSpaceOnUse"><stop stopColor="hsl(var(--primary))" stopOpacity="0.7"/><stop offset="1" stopColor="hsl(var(--primary))"/></linearGradient>
            <linearGradient id="paint1_linear_1_2" x1="50" y1="41.5" x2="50" y2="81.5" gradientUnits="userSpaceOnUse"><stop stopColor="hsl(var(--primary))" stopOpacity="0.8"/><stop offset="1" stopColor="hsl(var(--primary))"/></linearGradient>
            <linearGradient id="paint2_linear_1_2" x1="42.25" y1="3.5" x2="42.25" y2="26.5" gradientUnits="userSpaceOnUse"><stop stopColor="hsl(var(--primary))"/><stop offset="1" stopColor="hsl(var(--primary))" stopOpacity="0.5"/></linearGradient>
            <linearGradient id="paint3_linear_1_2" x1="57.75" y1="3.5" x2="57.75" y2="26.5" gradientUnits="userSpaceOnUse"><stop stopColor="hsl(var(--primary))"/><stop offset="1" stopColor="hsl(var(--primary))" stopOpacity="0.5"/></linearGradient>
        </defs>
    </svg>
);


const ActiveGiftBox = ({ className }: { className?: string }) => (
    <div className={cn("relative w-20 h-20", className)}>
        <UnlockedGiftBox className="animate-pulse" />
        <div className="absolute top-0 left-0 w-full h-full sparkle-animation" />
    </div>
);


const Milestone = ({ milestone, currentValue, isLast, isHighestUnlocked, onUnlock }: { milestone: typeof milestones[0], currentValue: number, isLast: boolean, isHighestUnlocked: boolean, onUnlock: () => void }) => {
    const isUnlocked = currentValue >= milestone.threshold;
    const ref = useRef<HTMLDivElement>(null);
    const prevUnlocked = useRef(isUnlocked);

    useEffect(() => {
        if(isUnlocked && !prevUnlocked.current) {
            onUnlock();
        }
        prevUnlocked.current = isUnlocked;
    }, [isUnlocked, onUnlock]);
    
    return (
        <div className={cn("flex items-center", isLast ? 'flex-grow-0' : 'flex-grow')}>
            <div className="relative flex flex-col items-center text-center gap-1">
                 <div ref={ref}>
                    {isHighestUnlocked ? (
                        <ActiveGiftBox />
                    ) : isUnlocked ? (
                        <UnlockedGiftBox />
                    ) : (
                        <LockedGiftBox />
                    )}
                </div>
                <div className="flex flex-col items-center h-10">
                    <p className="text-sm font-semibold">
                      {isUnlocked ? milestone.reward : "Mystery Box"}
                    </p>
                     {isUnlocked && <milestone.icon className="h-4 w-4 text-muted-foreground" />}
                </div>
                <p className="text-xs text-muted-foreground">₹{milestone.threshold}</p>
            </div>
             {!isLast && <div className="flex-grow h-0.5 bg-gray-200 border-t border-dashed" />}
        </div>
    );
};

export function CartProgressBar({ currentValue }: { currentValue: number }) {
  const [showConfetti, setShowConfetti] = useState(false);
  const { width, height } = useWindowSize();

  const handleUnlock = () => {
      setShowConfetti(true);
      const timer = setTimeout(() => setShowConfetti(false), 5000); // Confetti for 5 seconds
      return () => clearTimeout(timer);
  }

  const highestUnlockedIndex = milestones.reduce((highest, milestone, index) => {
    return currentValue >= milestone.threshold ? index : highest;
  }, -1);
  

  const nextMilestone = milestones.find(m => currentValue < m.threshold);
  const amountNeeded = nextMilestone ? nextMilestone.threshold - currentValue : 0;
  

  return (
    <Card className="overflow-hidden">
        {showConfetti && (
             <ReactConfetti
                width={width}
                height={height}
                recycle={false}
                numberOfPieces={500}
                gravity={0.1}
                tweenDuration={4900}
            />
        )}
        <CardContent className="p-6 space-y-4">
            <div className="flex justify-between items-start">
                {milestones.map((milestone, index) => (
                    <Milestone 
                        key={index} 
                        milestone={milestone} 
                        currentValue={currentValue}
                        isLast={index === milestones.length - 1}
                        isHighestUnlocked={index === highestUnlockedIndex}
                        onUnlock={handleUnlock}
                    />
                ))}
            </div>
            
             <div className="text-center text-sm font-medium">
                {nextMilestone ? (
                    <p>
                        Add <span className="font-bold text-primary">₹{amountNeeded.toFixed(0)}</span> more to unlock the <span className="font-semibold">{nextMilestone.reward}</span>!
                    </p>
                ) : (
                    <p className="font-bold text-green-600">Congratulations! You've unlocked all rewards!</p>
                )}
            </div>
        </CardContent>
    </Card>
  );
}

