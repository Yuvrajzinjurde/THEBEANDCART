

"use client";

import { cn } from '@/lib/utils';
import { useState, useEffect, useRef } from 'react';
import ReactConfetti from 'react-confetti';
import { useWindowSize } from '@react-hook/window-size';
import { Truck, Tag, Gift, Lock } from 'lucide-react';


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
  const [unlocked, setUnlocked] = useState<boolean[]>(milestones.map(m => currentValue >= m.threshold));
  const [showConfetti, setShowConfetti] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const newlyUnlocked = milestones.some((milestone, index) => {
      const isNowUnlocked = currentValue >= milestone.threshold;
      const wasLocked = !unlocked[index];
      return isNowUnlocked && wasLocked;
    });

    if (newlyUnlocked) {
      setShowConfetti(true);
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      timeoutRef.current = setTimeout(() => {
        setShowConfetti(false);
      }, 2500); // Shower for 2.5 seconds
    }
    
    // Update the unlocked status after checking
    setUnlocked(milestones.map(m => currentValue >= m.threshold));

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [currentValue]);


  const highestThreshold = Math.max(...milestones.map(m => m.threshold));
  const progressPercentage = Math.min((currentValue / highestThreshold) * 100, 100);

  const highestUnlockedIndex = unlocked.lastIndexOf(true);
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
        
        {/* Milestone Markers */}
        {milestones.map((milestone, index) => {
            const isUnlocked = unlocked[index];
            const milestonePercentage = (milestone.threshold / highestThreshold) * 100;
            const Icon = isUnlocked ? milestone.icon : Lock;
            return (
                 <div
                    key={index}
                    className="absolute top-0 h-6 flex flex-col items-center"
                    style={{ left: `${milestonePercentage}%`, transform: 'translateX(-50%)' }}
                >
                    <div className={cn(
                        "w-4 h-4 rounded-full border-2 flex items-center justify-center",
                        isUnlocked ? "bg-primary border-primary" : "bg-background border-muted-foreground"
                    )}>
                        {isUnlocked && <div className="w-2 h-2 bg-primary-foreground rounded-full" />}
                    </div>
                     <div className={cn(
                        "absolute top-full w-px h-2",
                         isUnlocked ? "bg-primary" : "bg-muted-foreground"
                    )}></div>
                     <div className={cn(
                        "absolute top-8 flex flex-col items-center gap-1 w-24 text-center text-xs transition-opacity duration-500",
                        currentValue >= milestone.threshold - 100 || isUnlocked ? "opacity-100" : "opacity-0"
                     )}>
                        <div className={cn("flex items-center justify-center h-8 w-8 rounded-full transition-colors duration-300", isUnlocked ? "bg-primary/10" : "bg-muted")}>
                           <Icon className={cn("h-5 w-5", isUnlocked ? "text-primary" : "text-muted-foreground/50")} />
                        </div>
                         <p className={cn("font-semibold", isUnlocked ? "text-primary" : "text-muted-foreground")}>
                            {isUnlocked ? milestone.reward : "Mystery Box"}
                        </p>
                     </div>
                </div>
            )
        })}
      </div>

       <div className="text-center text-sm font-medium mt-24">
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
