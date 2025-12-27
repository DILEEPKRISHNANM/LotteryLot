import { LotteryResultGridItem } from "@/components/lottery/lotteryGridUtils";

/**
 * Schedules a daily refresh of the data
 * @param refreshFn - The function to refresh the data
 * @returns The timeout for the refresh
 */
export const scheduleDailyRefresh = (refreshFn: any): NodeJS.Timeout => {
  const now = new Date();
  const target = new Date();
  target.setHours(16, 5, 0, 0);
  if (now > target) {
    target.setDate(target.getDate() + 1);
  }
  const timeUntilTarget = target.getTime() - now.getTime();
  return setTimeout(() => {
    refreshFn();
    scheduleDailyRefresh(refreshFn);
  }, timeUntilTarget);
};

/**
 * Checks if current time is past 4:05 PM today
 * @returns true if current time is past 4:05 PM, false otherwise
 */
export const isPast4PM = () => {
  const now = new Date();
  const today4PM = new Date();
  today4PM.setHours(16, 5, 0, 0);
  return now > today4PM;
};

/**
 * Checks if a result is the first row in the filtered results
 * @param filteredResults - The filtered results to check
 * @param result - The lottery result to che
 * @returns true if it's the first row, false otherwise
 */
export const isFirstRow = (
  filteredResults: any,
  result: LotteryResultGridItem
): boolean => {
  return filteredResults.length > 0 && filteredResults[0].id === result.id;
};
