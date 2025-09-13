"use client";

import { useState, useEffect, useMemo } from "react";
import { Loader2 } from "lucide-react";
import {
  getPasswordStrengthFeedback,
  type PasswordStrengthFeedbackOutput,
} from "@/ai/flows/password-strength-feedback";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

type PasswordStrengthProps = {
  password?: string;
};

export function PasswordStrength({ password }: PasswordStrengthProps) {
  const [feedback, setFeedback] = useState<PasswordStrengthFeedbackOutput | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const getFeedback = async () => {
      if (!password) {
        setFeedback(null);
        return;
      }
      setLoading(true);
      try {
        const result = await getPasswordStrengthFeedback({ password });
        setFeedback(result);
      } catch (error) {
        console.error("Failed to get password strength feedback:", error);
        setFeedback(null);
      } finally {
        setLoading(false);
      }
    };

    const handler = setTimeout(() => {
      getFeedback();
    }, 500);

    return () => {
      clearTimeout(handler);
    };
  }, [password]);

  const strengthDetails = useMemo(() => {
    if (!feedback) {
      return { value: 0, color: "", label: "" };
    }
    switch (feedback.strength.toLowerCase()) {
      case "weak":
        return { value: 33, color: "bg-destructive", label: "Weak" };
      case "moderate":
        return { value: 66, color: "bg-yellow-500", label: "Moderate" };
      case "strong":
        return { value: 100, color: "bg-green-500", label: "Strong" };
      default:
        return { value: 0, color: "", label: "" };
    }
  }, [feedback]);

  if (!password) {
    return null;
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2 text-sm">
        <Progress value={strengthDetails.value} className="h-2 w-full [&>div]:transition-all [&>div]:duration-500" indicatorClassName={strengthDetails.color} />
        <span className="w-20 shrink-0 text-right font-medium">
          {loading ? <Loader2 className="ml-auto h-4 w-4 animate-spin" /> : strengthDetails.label}
        </span>
      </div>
      {feedback && !loading && (
        <p className="text-xs text-muted-foreground">{feedback.feedback}</p>
      )}
    </div>
  );
}

// Add indicatorClassName to Progress component props to allow custom color styling
declare module "react" {
  interface HTMLAttributes<T> extends AriaAttributes, DOMAttributes<T> {
    indicatorClassName?: string;
  }
}
