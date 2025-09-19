

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
  const [unlockedMilestones, setUnlockedMilestones] = useState<number[]>([]);
  const [showConfetti, setShowConfetti] = useState(false);

  useEffect(() => {
    const newlyUnlocked: number[] = [];
    milestones.forEach((milestone, index) => {
      if (currentValue >= milestone.threshold && !unlockedMilestones.includes(index)) {
        newlyUnlocked.push(index);
      }
    });

    if (newlyUnlocked.length > 0) {
      setUnlockedMilestones(prev => [...prev, ...newlyUnlocked]);
      setShowConfetti(true);
      const timer = setTimeout(() => setShowConfetti(false), 2500); // Shower for 2.5 seconds
      return () => clearTimeout(timer);
    }
  }, [currentValue, unlockedMilestones]);

  const highestUnlockedIndex = unlockedMilestones.length > 0 ? Math.max(...unlockedMilestones) : -1;
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
      <div className="relative mb-6">
        <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
          <div
            className="h-full rounded-full bg-primary transition-all duration-500"
            style={{ width: `${Math.min((currentValue / (milestones[milestones.length-1].threshold)) * 100, 100)}%` }}
          />
        </div>
        <div className="absolute top-1/2 -translate-y-1/2 w-full flex justify-between">
          {milestones.map((milestone, index) => (
            <div
              key={index}
              className={cn(
                "h-5 w-5 rounded-full flex items-center justify-center transition-all duration-300",
                currentValue >= milestone.threshold ? 'bg-primary' : 'bg-muted'
              )}
              style={{ left: `${(milestone.threshold / milestones[milestones.length-1].threshold) * 100}%`, transform: 'translateX(-50%)', position: 'absolute' }}
            >
              {currentValue >= milestone.threshold && <div className="h-3 w-3 rounded-full bg-primary-foreground" />}
            </div>
          ))}
        </div>
      </div>
      <div className="flex justify-between items-start text-center text-xs">
        {milestones.map((milestone, index) => {
          const isUnlocked = currentValue >= milestone.threshold;
          const Icon = milestone.icon;
          return (
            <div key={index} className="flex flex-col items-center gap-1 w-24">
              <div className={cn("flex items-center justify-center h-8 w-8 rounded-full transition-colors duration-300", isUnlocked ? "bg-primary/10" : "bg-muted")}>
                {isUnlocked ? <Icon className="h-5 w-5 text-primary" /> : <Lock className="h-5 w-5 text-muted-foreground/50" />}
              </div>
              <p className={cn("font-semibold", isUnlocked ? "text-primary" : "text-muted-foreground")}>
                {isUnlocked ? milestone.reward : "Mystery Box"}
              </p>
              <p className="text-muted-foreground">₹{milestone.threshold}</p>
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
