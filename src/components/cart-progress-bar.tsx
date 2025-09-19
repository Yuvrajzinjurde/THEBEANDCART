
"use client";

import { Gift, Lock, Tag, Truck } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Card, CardContent } from './ui/card';
import { useState, useEffect, useRef } from 'react';
import ReactConfetti from 'react-confetti';
import { useWindowSize } from '@react-hook/window-size';


const milestones = [
  { threshold: 399, reward: "Free Delivery", icon: Truck },
  { threshold: 799, reward: "Extra 10% Off", icon: Tag },
  { threshold: 999, reward: "Free Gift", icon: Gift },
];

const maxThreshold = milestones[milestones.length - 1].threshold;


export function CartProgressBar({ currentValue }: { currentValue: number }) {
  const [unlockedIndex, setUnlockedIndex] = useState<number | null>(null);
  const [showConfetti, setShowConfetti] = useState(false);
  const { width, height } = useWindowSize();
  const prevValueRef = useRef(currentValue);

  useEffect(() => {
    let newlyUnlockedIndex: number | null = null;
    milestones.forEach((milestone, index) => {
        const wasUnlocked = prevValueRef.current >= milestone.threshold;
        const isUnlocked = currentValue >= milestone.threshold;
        if (isUnlocked && !wasUnlocked) {
            newlyUnlockedIndex = index;
        }
    });

    if (newlyUnlockedIndex !== null) {
        setUnlockedIndex(newlyUnlockedIndex);
        setShowConfetti(true);
        const timer = setTimeout(() => {
            setShowConfetti(false);
            setUnlockedIndex(null); // Reset after animation
        }, 5000); // Confetti duration
        return () => clearTimeout(timer);
    }
    prevValueRef.current = currentValue;

  }, [currentValue]);

  const nextMilestone = milestones.find(m => currentValue < m.threshold);
  const amountNeeded = nextMilestone ? nextMilestone.threshold - currentValue : 0;
  
  const progressPercentage = Math.min((currentValue / maxThreshold) * 100, 100);

  return (
    <Card className="overflow-hidden">
        {showConfetti && <ReactConfetti width={width} height={height} recycle={false} numberOfPieces={400} />}
        <CardContent className="p-6 space-y-4">
            <div className="relative w-full h-1 bg-gray-200 rounded-full">
                <div 
                    className="absolute top-0 left-0 h-full bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full transition-all duration-500"
                    style={{ width: `${progressPercentage}%` }}
                />
            </div>
            
             <div className="flex justify-between items-start">
                {milestones.map((milestone, index) => {
                    const isUnlocked = currentValue >= milestone.threshold;
                    const isUnlocking = unlockedIndex === index;
                    const Icon = milestone.icon;

                    return (
                        <div key={index} className="flex flex-col items-center gap-2 text-center w-24">
                           <div className={cn(
                                "relative flex h-16 w-16 items-center justify-center rounded-lg border-2 transition-all duration-500",
                                isUnlocked ? 'bg-blue-100 border-blue-400 shadow-lg' : 'bg-gray-100 border-gray-300'
                           )}>
                                {isUnlocked ? (
                                     <Icon className={cn(
                                        "h-8 w-8 text-blue-500 transition-all duration-300",
                                        isUnlocking && "animate-ping"
                                     )} />
                                ) : (
                                    <Lock className="h-8 w-8 text-gray-400" />
                                )}
                                {isUnlocking && <div className="absolute inset-0 bg-white/50 animate-ping rounded-lg" />}
                           </div>
                           <p className="text-xs font-semibold">{isUnlocked ? milestone.reward : '???'}</p>
                           <p className="text-xs text-muted-foreground">₹{milestone.threshold}</p>
                        </div>
                    );
                })}
            </div>
            
             <div className="text-center text-sm font-medium mt-2">
                {nextMilestone ? (
                    <p>
                        Add <span className="font-bold text-primary">₹{amountNeeded.toFixed(0)}</span> more to unlock the next surprise!
                    </p>
                ) : (
                    <p className="font-bold text-green-600">Congratulations! You've unlocked all rewards!</p>
                )}
            </div>
        </CardContent>
    </Card>
  );
}
