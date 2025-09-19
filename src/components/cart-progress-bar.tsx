
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
    <div className={cn("relative w-20 h-20 text-gray-300", className)}>
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[70%] h-[60%] bg-current rounded-t-md" />
        <div className="absolute bottom-[58%] left-1/2 -translate-x-1/2 w-[80%] h-[15%] bg-current rounded-sm" />
        <div className="absolute bottom-[72%] left-1/2 -translate-x-1/2 w-[12%] h-[10%] bg-current rounded-t-sm" />
    </div>
);

const UnlockedGiftBox = ({ className, milestone }: { className?: string, milestone: typeof milestones[0] }) => (
    <div className={cn("relative w-20 h-20 text-primary", className)}>
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[70%] h-[60%] bg-current rounded-t-md" />
        <div className="absolute bottom-[58%] left-1/2 -translate-x-1/2 w-[80%] h-[15%] bg-current rounded-sm" />
        <div className="absolute bottom-[72%] left-1/2 -translate-x-1/2 w-[12%] h-[10%] bg-current rounded-t-sm" />
        <milestone.icon className="absolute bottom-1 left-1/2 -translate-x-1/2 h-5 w-5 text-primary-foreground" />
    </div>
);

const ActiveGiftBox = ({ className, milestone }: { className?: string, milestone: typeof milestones[0] }) => (
     <div className={cn("relative w-20 h-20 text-primary", className)}>
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[70%] h-[60%] bg-current rounded-t-md" />
        <div className="absolute bottom-[65%] left-1/2 -translate-x-1/2 w-[80%] h-[15%] bg-current rounded-sm" />
        <div className="absolute bottom-[78%] left-1/2 -translate-x-1/2 w-[12%] h-[10%] bg-current rounded-t-sm" />
        <milestone.icon className="absolute bottom-1 left-1/2 -translate-x-1/2 h-5 w-5 text-primary-foreground" />
        <div className="absolute top-0 left-0 w-full h-full animate-pulse">
            <div className="absolute top-[15%] left-[10%] w-2 h-2 bg-amber-300 rounded-full" style={{ animation: 'sparkle 1.5s infinite alternate', animationDelay: '0s' }} />
            <div className="absolute top-[25%] right-[5%] w-1 h-1 bg-amber-300 rounded-full" style={{ animation: 'sparkle 1.5s infinite alternate', animationDelay: '0.5s' }} />
            <div className="absolute bottom-[40%] left-[5%] w-1.5 h-1.5 bg-amber-300 rounded-full" style={{ animation: 'sparkle 1.5s infinite alternate', animationDelay: '1s' }}/>
        </div>
    </div>
);


const Milestone = ({ milestone, currentValue, isLast, isHighestUnlocked }: { milestone: typeof milestones[0], currentValue: number, isLast: boolean, isHighestUnlocked: boolean }) => {
    const isUnlocked = currentValue >= milestone.threshold;
    
    return (
        <div className={cn("flex items-center", isLast && 'flex-grow-0', !isLast && 'flex-grow')}>
            <div className="relative flex flex-col items-center text-center gap-1">
                 {isHighestUnlocked ? (
                    <ActiveGiftBox milestone={milestone} />
                ) : isUnlocked ? (
                    <UnlockedGiftBox milestone={milestone} />
                ) : (
                    <LockedGiftBox />
                )}
                <p className="text-sm font-semibold h-5">
                  {isUnlocked ? milestone.reward : "Mystery Box"}
                </p>
                <p className="text-xs text-muted-foreground">₹{milestone.threshold}</p>
            </div>
             {!isLast && <div className="flex-grow h-0.5 bg-gray-200 border-t border-dashed" />}
        </div>
    );
};

export function CartProgressBar({ currentValue }: { currentValue: number }) {
  const [showConfetti, setShowConfetti] = useState(false);
  const { width, height } = useWindowSize();
  const prevValueRef = useRef(currentValue);

  const highestUnlockedIndex = milestones.reduce((highest, milestone, index) => {
    return currentValue >= milestone.threshold ? index : highest;
  }, -1);
  
  useEffect(() => {
    let justUnlocked = false;
    milestones.forEach((milestone) => {
        const wasUnlocked = prevValueRef.current >= milestone.threshold;
        const isUnlocked = currentValue >= milestone.threshold;
        if (isUnlocked && !wasUnlocked) {
            justUnlocked = true;
        }
    });
    
    if (justUnlocked) {
        setShowConfetti(true);
        const timer = setTimeout(() => setShowConfetti(false), 5000);
        return () => clearTimeout(timer);
    }

    prevValueRef.current = currentValue;

  }, [currentValue]);


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
