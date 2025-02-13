import { z } from "zod";

// Define validation schema using Zod
export const contractSchema = z.object({
    contractId: z.string().min(1, "Contract ID is required."),
    clientEmail: z.string().email("Invalid client email format."),
    vendorEmail: z.string().email("Invalid vendor email format."),
    title: z.string().min(1, "Title is required."),
    description: z.string().min(1, "Description is required."),
    budget: z.number().positive("Budget must be greater than 0."),
    paymentType: z.enum(["milestone", "hourly", "fixed"]),

    milestones: z
        .array(
            z.object({
                title: z.string().min(1, "Milestone title is required."),
                amount: z.number().positive("Milestone amount must be greater than 0."),
                description: z.string().min(1, "Milestone description is required."),
            })
        )
        .nonempty("At least one milestone is required."),

    startDate: z.string().refine((date) => !isNaN(Date.parse(date)), {
        message: "Invalid date format.",
    }),
    endDate: z.string().refine((date) => !isNaN(Date.parse(date)), {
        message: "Invalid date format.",
    }),

    contractTemplate: z.string().nullable().optional(),

    contractFile: z.union([z.string().url("Invalid contract file URL"), z.instanceof(File)]).optional(),
})
    .refine((data) => new Date(data.startDate) < new Date(data.endDate), {
        message: "Start date must be before end date.",
        path: ["endDate"],
    });
