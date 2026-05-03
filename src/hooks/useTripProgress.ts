import { useMemo } from 'react';
import { useAppStore } from '../store/useAppStore';

export function useTripProgress() {
  const totalSaved = useAppStore((state) => state.totalSaved);
  const goalAmount = useAppStore((state) => state.tripConfig.goalAmount);

  return useMemo(() => {
    const percentage = goalAmount > 0 ? (totalSaved / goalAmount) * 100 : 0;
    const isCompleted = goalAmount > 0 && totalSaved >= goalAmount;
    
    // Calculate current milestone
    const milestones = [25, 50, 75, 90, 100];
    const currentMilestone = milestones.reverse().find(m => percentage >= m) || 0;

    return {
      percentage,
      isCompleted,
      currentMilestone,
      remainingAmount: Math.max(0, goalAmount - totalSaved),
    };
  }, [totalSaved, goalAmount]);
}
