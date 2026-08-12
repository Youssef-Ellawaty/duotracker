import { SubjectGoal } from '../types';

export interface ScoreBreakdown {
  totalTarget: number;
  totalCompleted: number;
  plannedCompleted: number;
  completionRate: number; // 0 - 100%
  overachievementSessions: number; // extra sessions above target on planned
  unplannedSessions: number; // sessions on 0-target subjects
  bonusPoints: number; // Total bonus points (5 pts per extra planned + 10 pts per unplanned)
  finalScore: number; // completionRate + bonusPoints
}

export function calculateWeeklyScore(subjectGoals: SubjectGoal[]): ScoreBreakdown {
  let totalTarget = 0;
  let totalCompleted = 0;
  let plannedCompleted = 0;
  let overachievementSessions = 0;
  let unplannedSessions = 0;

  for (const item of subjectGoals) {
    totalCompleted += item.completedSessions;

    if (item.targetSessions > 0) {
      totalTarget += item.targetSessions;
      // Cap for base completion rate
      plannedCompleted += Math.min(item.completedSessions, item.targetSessions);
      // Overachievement on planned subject
      if (item.completedSessions > item.targetSessions) {
        overachievementSessions += (item.completedSessions - item.targetSessions);
      }
    } else {
      // 0-target (unplanned / extra) subject
      unplannedSessions += item.completedSessions;
    }
  }

  if (totalTarget === 0) {
    return {
      totalTarget: 0,
      totalCompleted,
      plannedCompleted: 0,
      completionRate: 0,
      overachievementSessions: 0,
      unplannedSessions,
      bonusPoints: 0,
      finalScore: 0,
    };
  }

  const completionRate = Math.round((plannedCompleted / totalTarget) * 100);
  
  // Bonus logic: 5 points per extra session on planned subjects + 10 points per session on unplanned subjects
  const bonusPoints = (overachievementSessions * 5) + (unplannedSessions * 10);
  const finalScore = completionRate + bonusPoints;

  return {
    totalTarget,
    totalCompleted,
    plannedCompleted,
    completionRate,
    overachievementSessions,
    unplannedSessions,
    bonusPoints,
    finalScore,
  };
}
