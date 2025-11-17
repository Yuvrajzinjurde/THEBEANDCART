import { z } from 'zod';

export const CouponFormSchema = z.object({
  code: z.string().min(3, "Code must be at least 3 characters long.").toUpperCase(),
  type: z.enum(['percentage', 'fixed', 'free-shipping']),
  value: z.coerce.number().optional(),
  minPurchase: z.coerce.number().min(0, "Minimum purchase must be a positive number.").default(0),
  brand: z.string().min(1, "A brand must be selected."),
  startDate: z.date().optional(),
  endDate: z.date().optional(),
})
.superRefine((data, ctx) => {
    // 1. End date must be after start date
    if (data.startDate && data.endDate && data.endDate <= data.startDate) {
        ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "End date must be after the start date.",
            path: ["endDate"],
        });
    }

    // 2. 'value' is required for 'percentage' or 'fixed' types
    if (data.type === 'percentage' || data.type === 'fixed') {
        if (typeof data.value !== 'number') {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: "A discount value is required.",
                path: ["value"],
            });
        } else if (data.value < 0) {
             ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: "Discount value cannot be negative.",
                path: ["value"],
            });
        } else if (data.type === 'percentage' && data.value > 100) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: "Percentage value cannot exceed 100.",
                path: ["value"],
            });
        }
    }
    
    // 3. 'value' must NOT exist for 'free-shipping'
    if (data.type === 'free-shipping' && data.value !== undefined) {
      ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Value should not be set for free shipping coupons.",
          path: ["value"],
      });
    }
});


export type CouponFormValues = z.infer<typeof CouponFormSchema>;
