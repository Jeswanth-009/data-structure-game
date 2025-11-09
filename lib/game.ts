import { Case } from '@/types/game';

export const isCaseUnlocked = (caseData: Case): boolean => {
  const unlockTime = new Date(caseData.unlock_time);
  const now = new Date();
  return now >= unlockTime;
};

export const getTimeUntilUnlock = (unlockTime: string): string => {
  const unlock = new Date(unlockTime);
  const now = new Date();
  const diff = unlock.getTime() - now.getTime();

  if (diff <= 0) return 'Unlocked';

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

  if (days > 0) return `${days}d ${hours}h`;
  if (hours > 0) return `${hours}h ${minutes}m`;
  return `${minutes}m`;
};

export const calculateScore = (
  correctAnswers: number,
  wrongAnswers: number
): number => {
  // Simple scoring: 1 point per correct answer, no penalties
  return correctAnswers;
};

export const formatTime = (seconds: number): string => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};
