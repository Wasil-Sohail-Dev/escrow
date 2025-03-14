export interface Milestone {
  title: string;
  amount: number;
  description: string;
  status: string;
  milestoneId: string;
  completionPercentage?: number;
}

const CONTRACT_STATUS_WEIGHTS = {
  draft: 0,
  onboarding: 10,
  funding_pending: 20,
  funding_processing: 30,
  funding_onhold: 30,
  active: 50,
  in_review: 70,
  completed: 100,
  cancelled: 0,
  disputed: 40,
  disputed_in_process: 45,
  disputed_resolved: 60,
} as const;

export type ContractStatus = keyof typeof CONTRACT_STATUS_WEIGHTS;

export const calculateProgress = (milestones: Milestone[]) => {
  const totalMileStones = milestones.length;
  const completedMileStones = milestones.filter(
    (milestone) =>
      milestone.status === "approved" || milestone.status === "payment_released"
  ).length;
  const progress = (completedMileStones / totalMileStones) * 100;
  return progress;
};
