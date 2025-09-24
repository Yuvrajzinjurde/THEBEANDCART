
"use client";

import { useState, useEffect, useMemo } from "react";
import {
  getPasswordStrengthFeedback,
  type PasswordStrengthFeedbackOutput,
} from "@/ai/flows/password-strength-feedback";
import { cn } from "@/lib/utils";
import { Loader } from "../ui/loader";
import usePlatformSettingsStore from "@/stores/platform-settings-store";

type PasswordStrengthProps = {
  password?: string;
};

export function PasswordStrength({ password }: PasswordStrengthProps) {
  const { settings } = usePlatformSettingsStore();
  const [feedback, setFeedback] = useState<PasswordStrengthFeedbackOutput | null>(null);
  const [loading, setLoading] = useState(false);
  
  const aiEnabled = settings.aiEnabled;

  useEffect(() => {
    if (!aiEnabled) return;

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
  }, [password, aiEnabled]);

  const strengthDetails = useMemo(() => {
    if (!aiEnabled || !feedback?.strength) {
      return { level: 0, color: "bg-muted", label: "" };
    }
    switch (feedback.strength.toLowerCase()) {
      case "weak":
        return { level: 1, color: "bg-destructive", label: "Weak" };
      case "moderate":
        return { level: 2, color: "bg-yellow-500", label: "Moderate" };
      case "strong":
        return { level: 3, color: "bg-green-500", label: "Strong" };
      default:
        return { level: 0, color: "bg-muted", label: "" };
    }
  }, [feedback, aiEnabled]);

  if (!password || !aiEnabled) {
    return null;
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <div className="grid grid-cols-3 gap-1.5 w-full">
            <div className={cn("h-2 rounded-full transition-colors", strengthDetails.level >= 1 ? strengthDetails.color : "bg-muted")} />
            <div className={cn("h-2 rounded-full transition-colors", strengthDetails.level >= 2 ? strengthDetails.color : "bg-muted")} />
            <div className={cn("h-2 rounded-full transition-colors", strengthDetails.level >= 3 ? strengthDetails.color : "bg-muted")} />
        </div>
        <span className="w-20 shrink-0 text-right font-medium text-sm">
          {loading ? <Loader className="ml-auto h-4 w-4" /> : strengthDetails.label}
        </span>
      </div>
      {feedback && !loading && (
        <p className="text-xs text-muted-foreground">{feedback.feedback}</p>
      )}
    </div>
  );
}
