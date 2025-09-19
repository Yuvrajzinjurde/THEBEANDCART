

"use client";

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

export function CartProgressBar({ currentValue }: { currentValue: number }) {
  const { width, height } = useWindowSize();
  const [newlyUnlocked, setNewlyUnlocked] = useState<number[]>([]);
  const [showConfetti, setShowConfetti] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);


  useEffect(() => {
    const justUnlocked: number[] = [];
    milestones.forEach((milestone, index) => {
        // Check if it's unlocked now but wasn't in the list before
        if (currentValue >= milestone.threshold && !newlyUnlocked.includes(index)) {
            justUnlocked.push(index);
        }
    });

    if (justUnlocked.length > 0) {
      setNewlyUnlocked(prev => [...prev, ...justUnlocked]);
      setShowConfetti(true);
      
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      timeoutRef.current = setTimeout(() => {
          setShowConfetti(false);
      }, 2500); // Shower for 2.5 seconds
    }
     return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [currentValue]);


  const highestThreshold = Math.max(...milestones.map(m => m.threshold));
  const progressPercentage = Math.min((currentValue / highestThreshold) * 100, 100);

  const highestUnlockedIndex = milestones.reduce((highest, milestone, index) => {
    return currentValue >= milestone.threshold ? index : highest;
  }, -1);

  const nextMilestone = milestones[highestUnlockedIndex + 1];
  const amountNeeded = nextMilestone ? nextMilestone.threshold - currentValue : 0;

  return (
    <div className="w-full py-4">
      {showConfetti && (
        <ReactConfetti
          width={width}
          height={height}
          recycle={false}
          numberOfPieces={150}
          gravity={0.15}
          drawShape={drawCoin}
        />
      )}
      <div className="relative mb-8 pt-4">
        {/* Progress Bar Track and Fill */}
        <div className="h-2 w-full rounded-full bg-muted">
          <div
            className="h-full rounded-full bg-primary transition-all duration-500"
            style={{ width: `${progressPercentage}%` }}
          />
        </div>
        
        {/* Milestone Circles */}
        {milestones.map((milestone, index) => {
            const isUnlocked = currentValue >= milestone.threshold;
            const milestonePercentage = (milestone.threshold / highestThreshold) * 100;
            return (
                 <div
                    key={index}
                    className="absolute top-0 h-6"
                    style={{ left: `${milestonePercentage}%`, transform: 'translateX(-50%)' }}
                >
                    <div className={cn(
                        "w-4 h-4 rounded-full border-2",
                        isUnlocked ? "bg-primary border-primary" : "bg-background border-muted-foreground"
                    )}></div>
                     <div className={cn(
                        "absolute top-full left-1/2 w-px h-2",
                         isUnlocked ? "bg-primary" : "bg-muted-foreground"
                    )}></div>
                </div>
            )
        })}
      </div>

       <div className="flex justify-between items-start text-center text-xs mt-2">
        {milestones.map((milestone, index) => {
          const isUnlocked = currentValue >= milestone.threshold;
          const Icon = milestone.icon;
          return (
            <div key={index} className="flex flex-col items-center gap-1 w-24">
              <div className={cn("flex items-center justify-center h-8 w-8 rounded-full transition-colors duration-300", isUnlocked ? "bg-primary/10" : "bg-muted")}>
                <Icon className={cn("h-5 w-5", isUnlocked ? "text-primary" : "text-muted-foreground/50")} />
              </div>
              <p className={cn("font-semibold", isUnlocked ? "text-primary" : "text-muted-foreground")}>
                {milestone.reward}
              </p>
            </div>
          )
        })}
      </div>

       <div className="text-center text-sm font-medium mt-6">
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
