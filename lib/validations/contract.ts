import * as z from "zod";

const milestoneSchema = z.object({
  name: z.string().min(3, "Milestone name must be at least 3 characters"),
  amount: z.string().refine(
    (val) => {
      const num = parseFloat(val);
      return !isNaN(num) && num > 0 && Number.isInteger(num);
    },
    { message: "Amount must be a valid whole number greater than 0" }
  ),
  description: z.string().min(200, "Description must be at least 200 characters"),
  startDate: z.string().min(1, "Start date is required"),
  endDate: z.string().min(1, "End date is required"),
});

export const contractSchema = z.object({
  contractId: z.string(),
  vendorEmail: z.string().email("Invalid email format"),
  title: z.string().min(3, "Title must be at least 3 characters"),
  startDate: z.string().min(1, "Start date is required"),
  endDate: z.string().min(1, "End date is required"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  paymentType: z.enum(["hourly", "fixed"]),
  contractType: z.enum(["services", "products"]).default("services"),
  totalPayment: z.string().refine(
    (val) => {
      const num = parseFloat(val);
      return !isNaN(num) && num > 0 && Number.isInteger(num);
    },
    { message: "Total payment must be a valid whole number greater than 0" }
  ),
  isSelected: z.boolean().optional().default(false),
  milestones: z.array(milestoneSchema),
  documents: z.array(z.any()).optional().default([]),
  contractTemplate: z.string().optional(),
});

export type ContractFormData = z.infer<typeof contractSchema>;

// Custom validation functions
export const validateDates = (startDate: string, endDate: string): boolean => {
  if (!startDate || !endDate) return true;
  return new Date(startDate) < new Date(endDate);
};

export const validatePayments = (totalPayment: string, milestones: any[]): { isValid: boolean; error: string } => {
  const totalProjectPayment = parseFloat(totalPayment) || 0;
  const milestoneTotalAmount = milestones.reduce(
    (sum, milestone) => sum + (parseFloat(milestone.amount) || 0),
    0
  );

  if (totalProjectPayment !== milestoneTotalAmount) {
    return {
      isValid: false,
      error: `Total milestone amounts (${milestoneTotalAmount}) must equal total project payment (${totalProjectPayment})`
    };
  }

  return { isValid: true, error: "" };
}; 