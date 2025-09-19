
"use client";

import { cn } from '@/lib/utils';
import { Card, CardContent } from './ui/card';
import { useState, useEffect, useRef } from 'react';
import ReactConfetti from 'react-confetti';
import { useWindowSize } from '@react-hook/window-size';
import useMeasure from 'react-use-measure'
import { Truck, Tag, Gift } from 'lucide-react';


const milestones = [
  { threshold: 399, reward: "Free Delivery", icon: Truck },
  { threshold: 799, reward: "Extra 10% Off", icon: Tag },
  { threshold: 999, reward: "Free Gift", icon: Gift },
];

const LockedGiftBox = ({ className }: { className?: string }) => (
    <svg width="60" height="60" viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg" className={cn("text-gray-300", className)}>
        <rect x="10" y="30" width="60" height="45" rx="5" fill="currentColor"/>
        <rect x="2" y="15" width="76" height="20" rx="5" fill="currentColor"/>
        <path d="M35 15C35 8.37258 40.3726 3 47 3V15H35Z" fill="currentColor"/>
        <path d="M45 15C45 8.37258 39.6274 3 33 3V15H45Z" fill="currentColor"/>
        <rect x="32" y="47" width="16" height="12" rx="3" fill="#B0B0B0"/>
        <path d="M40 40C44.4183 40 48 43.5817 48 48V52H32V48C32 43.5817 35.5817 40 40 40Z" fill="#C8C8C8"/>
    </svg>
)

const UnlockedGiftBox = ({ className }: { className?: string }) => (
    <svg width="60" height="60" viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg" className={cn("text-blue-500", className)}>
        <rect x="10" y="30" width="60" height="45" rx="5" fill="currentColor"/>
        <rect x="2" y="15" width="76" height="20" rx="5" fill="currentColor"/>
        <path d="M35 15C35 8.37258 40.3726 3 47 3V15H35Z" fill="currentColor"/>
        <path d="M45 15C45 8.37258 39.6274 3 33 3V15H45Z" fill="currentColor"/>
    </svg>
)

const ActiveGiftBox = ({ className }: { className?: string }) => (
    <svg width="80" height="80" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className={cn("text-blue-500 drop-shadow-lg", className)}>
        <path d="M96.5 28.5C96.5 27.3954 95.6046 26.5 94.5 26.5H5.5C4.39543 26.5 3.5 27.3954 3.5 28.5V41.5H96.5V28.5Z" fill="url(#paint0_linear_1_2)"/>
        <path d="M13.5 41.5V78.5C13.5 79.6046 14.3954 80.5 15.5 80.5H84.5C85.6046 80.5 86.5 79.6046 86.5 78.5V41.5H13.5Z" fill="url(#paint1_linear_1_2)"/>
        <path d="M50 3.5C41.4396 3.5 34.5 10.4396 34.5 19V26.5H50V3.5Z" fill="url(#paint2_linear_1_2)"/>
        <path d="M50 3.5C58.5604 3.5 65.5 10.4396 65.5 19V26.5H50V3.5Z" fill="url(#paint3_linear_1_2)"/>
        <path d="M26.216 67.8927C44.7838 88.0315 70.1651 86.9452 79.7997 73.5418" stroke="white" stroke-width="3" stroke-linecap="round"/>
        <path d="M92 21.5L88.5 25L92 28.5L88.5 32" stroke="#4C82F7" stroke-width="3" stroke-linecap="round"/>
        <defs>
            <linearGradient id="paint0_linear_1_2" x1="50" y1="26.5" x2="50" y2="41.5" gradientUnits="userSpaceOnUse"><stop stop-color="#729FF8"/><stop offset="1" stop-color="#4C82F7"/></linearGradient>
            <linearGradient id="paint1_linear_1_2" x1="50" y1="41.5" x2="50" y2="80.5" gradientUnits="userSpaceOnUse"><stop stop-color="#558AF7"/><stop offset="1" stop-color="#3B76F6"/></linearGradient>
            <linearGradient id="paint2_linear_1_2" x1="42.25" y1="3.5" x2="42.25" y2="26.5" gradientUnits="userSpaceOnUse"><stop stop-color="#729FF8"/><stop offset="1" stop-color="#4C82F7"/></linearGradient>
            <linearGradient id="paint3_linear_1_2" x1="57.75" y1="3.5" x2="57.75" y2="26.5" gradientUnits="userSpaceOnUse"><stop stop-color="#729FF8"/><stop offset="1" stop-color="#4C82F7"/></linearGradient>
        </defs>
    </svg>
)

const Milestone = ({ milestone, currentValue, isLast, isHighestUnlocked, onPlaced }: { milestone: typeof milestones[0], currentValue: number, isLast: boolean, isHighestUnlocked: boolean, onPlaced: (ref: DOMRect | undefined) => void }) => {
    const [ref, {x, y, width, height}] = useMeasure();
    const isUnlocked = currentValue >= milestone.threshold;
    
    useEffect(() => {
        if (isHighestUnlocked) {
            onPlaced(ref.current?.getBoundingClientRect());
        }
    }, [isHighestUnlocked, onPlaced, ref, x, y, width, height]);


    return (
        <div className="flex items-center">
            <div ref={ref} className="relative flex flex-col items-center text-center">
                {isHighestUnlocked ? (
                    <ActiveGiftBox />
                ) : isUnlocked ? (
                    <UnlockedGiftBox />
                ) : (
                    <LockedGiftBox />
                )}
                {isUnlocked ? (
                    <milestone.icon className="h-6 w-6 text-blue-600 absolute top-1/2 -translate-y-1/2" />
                ) : null}
                <p className="text-sm font-semibold mt-2 h-10 flex items-center">
                  {isUnlocked ? milestone.reward : "Mystery Box"}
                </p>
                <p className="text-xs text-muted-foreground">₹{milestone.threshold}</p>
            </div>
            {!isLast && <div className="w-16 h-1 bg-gray-200 mx-4" />}
        </div>
    );
};

export function CartProgressBar({ currentValue }: { currentValue: number }) {
  const [showConfetti, setShowConfetti] = useState(false);
  const [confettiPos, setConfettiPos] = useState<{x: number, y: number, w: number, h: number} | null>(null);
  const { width, height } = useWindowSize();
  const prevValueRef = useRef(currentValue);

  const highestUnlockedIndex = milestones.reduce((highest, milestone, index) => {
    return currentValue >= milestone.threshold ? index : highest;
  }, -1);
  
  useEffect(() => {
    let justUnlocked = false;
    milestones.forEach((milestone, index) => {
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
  
  const handleMilestonePlacement = (rect: DOMRect | undefined) => {
      if (rect) {
          setConfettiPos({ x: rect.left, y: rect.top, w: rect.width, h: rect.height });
      }
  }

  return (
    <Card className="overflow-hidden">
        {showConfetti && confettiPos && (
             <ReactConfetti
                width={width}
                height={height}
                recycle={false}
                numberOfPieces={400}
                gravity={0.15}
                initialVelocityX={10}
                initialVelocityY={20}
                confettiSource={{
                    x: confettiPos.x + confettiPos.w / 2,
                    y: confettiPos.y,
                    w: 0,
                    h: 0,
                }}
            />
        )}
        <CardContent className="p-6 space-y-6">
            <div className="flex justify-center items-start">
                {milestones.map((milestone, index) => (
                    <Milestone 
                        key={index} 
                        milestone={milestone} 
                        currentValue={currentValue}
                        isLast={index === milestones.length - 1}
                        isHighestUnlocked={index === highestUnlockedIndex}
                        onPlaced={handleMilestonePlacement}
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
