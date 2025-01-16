export interface Milestone {
    title: string;
    amount: number;
    description: string;
    status: string;
    milestoneId: string;
  }

export const calculateProgress = (milestones: Milestone[]) => {
    const total = milestones.length;
    const completed = milestones.filter((m) => m.status === "completed").length;
    return total > 0 ? Math.round((completed / total) * 100) : 0;
  };