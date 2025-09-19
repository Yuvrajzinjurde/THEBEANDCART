
"use client";

import { Gift, Tag, Truck } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import { Card, CardContent } from './ui/card';

const milestones = [
  { threshold: 399, reward: "Free Delivery", icon: Truck },
  { threshold: 799, reward: "Extra 10% Off", icon: Tag },
  { threshold: 999, reward: "Free Gift", icon: Gift },
];

const maxThreshold = milestones[milestones.length - 1].threshold;

export function CartProgressBar({ currentValue }: { currentValue: number }) {
  const progress = Math.min((currentValue / maxThreshold) * 100, 100);

  const nextMilestone = milestones.find(m => currentValue < m.threshold);
  const amountNeeded = nextMilestone ? nextMilestone.threshold - currentValue : 0;
  
  const getMilestoneStatus = (threshold: number) => {
    if (currentValue >= threshold) return 'unlocked';
    if (nextMilestone && threshold === nextMilestone.threshold) return 'active';
    return 'locked';
  };

  return (
    <Card className="overflow-hidden">
        <CardContent className="p-4 space-y-3">
            <div className="relative h-4">
                <Progress value={progress} className="h-full" indicatorClassName="bg-gradient-to-r from-yellow-400 to-orange-500" />
                {milestones.map((milestone, index) => {
                    const status = getMilestoneStatus(milestone.threshold);
                    const leftPosition = (milestone.threshold / maxThreshold) * 100;
                    
                    return (
                        <div
                            key={index}
                            className={cn(
                                "absolute -top-1/2 flex h-8 w-8 items-center justify-center rounded-full border-2 transition-all duration-300",
                                {
                                    'bg-background border-muted-foreground/30': status === 'locked',
                                    'bg-yellow-100 border-yellow-400 shadow-md scale-110': status === 'active',
                                    'bg-green-100 border-green-500 shadow-lg': status === 'unlocked',
                                }
                            )}
                            style={{ left: `calc(${leftPosition}% - 16px)` }}
                        >
                            <milestone.icon className={cn(
                                "h-4 w-4",
                                {
                                    'text-muted-foreground/50': status === 'locked',
                                    'text-yellow-600': status === 'active',
                                    'text-green-600': status === 'unlocked',
                                }
                            )} />
                        </div>
                    )
                })}
            </div>
             <div className="text-center text-sm font-medium mt-2">
                {nextMilestone ? (
                    <p>
                        Add <span className="font-bold text-primary">₹{amountNeeded.toFixed(0)}</span> more to unlock{' '}
                        <span className="font-bold">{nextMilestone.reward}!</span>
                    </p>
                ) : (
                    <p className="font-bold text-green-600">Congratulations! You've unlocked all rewards!</p>
                )}
            </div>
        </CardContent>
    </Card>
  );
}
