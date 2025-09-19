
"use client";

import React from "react";
import { cn } from '@/lib/utils';
import { Calendar, Box, Package, ShoppingBag, Pencil } from 'lucide-react';

const steps = [
  { name: "Occasion", icon: Calendar },
  { name: "Choose Box", icon: Box },
  { name: "Fill Hamper", icon: Package },
  { name: "Choose Bag", icon: ShoppingBag },
  { name: "Add Notes", icon: Pencil },
];

const Milestone = ({
    step,
    isUnlocked,
    isCurrent,
}: {
    step: typeof steps[0];
    isUnlocked: boolean;
    isCurrent: boolean;
}) => {
    const { name, icon: Icon } = step;

    return (
        <div className="flex flex-col items-center text-center w-24">
            <div 
                className={cn(
                    "h-10 w-10 flex items-center justify-center rounded-full transition-all duration-300",
                    isCurrent ? "bg-primary text-primary-foreground" : isUnlocked ? "bg-primary/20 text-primary" : "bg-muted text-muted-foreground",
                )} 
            >
                <Icon className="h-5 w-5" />
            </div>
            <div className="mt-1 h-12 flex flex-col items-center">
                <p className={cn(
                    "text-xs font-semibold",
                    isCurrent ? "text-primary" : isUnlocked ? "text-foreground" : "text-muted-foreground"
                )}>
                    {name}
                </p>
            </div>
        </div>
    );
};


export function HamperProgressBar({ currentStep, totalSteps }: { currentStep: number, totalSteps: number }) {
  
  const progressPercentage = Math.min(((currentStep -1) / (totalSteps - 1)) * 100, 100);

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div className="relative flex justify-between items-start">
        <div className="absolute top-[19px] left-0 w-full h-0.5 bg-muted -z-10">
            <div className="h-full bg-primary transition-all duration-300" style={{ width: `${progressPercentage}%` }}></div>
        </div>
        {steps.map((step, index) => {
          const stepNumber = index + 1;
          const isUnlocked = currentStep >= stepNumber;
          const isCurrent = currentStep === stepNumber;
          
          return (
            <React.Fragment key={step.name}>
              <Milestone
                step={step}
                isUnlocked={isUnlocked}
                isCurrent={isCurrent}
              />
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
}
