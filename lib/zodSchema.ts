import { z } from "zod";

// Define validation schema using Zod
export const contractSchema = z.object({
    contractId: z.string().min(1),
    clientEmail: z.string().min(1),
    title: z.string().min(1),
    description: z.string().min(1),
    vendorEmail: z.string().email(),
    budget: z.number().positive(),
    paymentType: z.enum(["milestone", "hourly", "fixed"]),
    milestones: z
        .array(
            z.object({
                title: z.string().min(1),
                amount: z.number().positive(),
                description: z.string().min(1),
            })
        )
        .nonempty(),
    startDate: z.string().refine((date) => !isNaN(Date.parse(date)), {
        message: "Invalid date format.",
    }),
    endDate: z.string().refine((date) => !isNaN(Date.parse(date)), {
        message: "Invalid date format.",
    }),
    contractTemplate: z.string().optional(),
    contractFile: z.string().optional(),
});
