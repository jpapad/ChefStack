import { HaccpLog, HaccpItem, HaccpReminder } from '../types';

/**
 * Temperature safe ranges by item type
 */
const SAFE_TEMP_RANGES: Record<string, { min: number; max: number }> = {
  // Refrigeration
  fridge: { min: 0, max: 5 },
  freezer: { min: -25, max: -18 },
  
  // Hot holding
  hot_hold: { min: 63, max: 100 },
  
  // Cooking temps
  poultry: { min: 74, max: 100 },
  ground_meat: { min: 71, max: 100 },
  whole_meat: { min: 63, max: 100 },
  fish: { min: 63, max: 100 },
  eggs: { min: 71, max: 100 },
  
  // Reheating
  reheat: { min: 75, max: 100 },
  
  // Display
  cold_display: { min: 0, max: 5 },
  hot_display: { min: 63, max: 100 }
};

/**
 * Check if a temperature reading is out of safe range
 */
export const isTemperatureOutOfRange = (
  value: string | undefined,
  itemName: string
): boolean => {
  if (!value) return false;
  
  const temp = parseFloat(value);
  if (isNaN(temp)) return false;
  
  // Try to infer range from item name (simple heuristic)
  const nameLower = itemName.toLowerCase();
  let range: { min: number; max: number } | undefined;
  
  if (nameLower.includes('ψυγείο') || nameLower.includes('fridge') || nameLower.includes('refrigerat')) {
    range = SAFE_TEMP_RANGES.fridge;
  } else if (nameLower.includes('καταψύκτ') || nameLower.includes('freezer')) {
    range = SAFE_TEMP_RANGES.freezer;
  } else if (nameLower.includes('ζεστό') || nameLower.includes('hot') || nameLower.includes('bain marie')) {
    range = SAFE_TEMP_RANGES.hot_hold;
  } else if (nameLower.includes('κοτόπουλο') || nameLower.includes('poultry') || nameLower.includes('chicken')) {
    range = SAFE_TEMP_RANGES.poultry;
  } else if (nameLower.includes('κιμά') || nameLower.includes('ground')) {
    range = SAFE_TEMP_RANGES.ground_meat;
  } else if (nameLower.includes('ψάρι') || nameLower.includes('fish')) {
    range = SAFE_TEMP_RANGES.fish;
  } else if (nameLower.includes('αναθέρμαν') || nameLower.includes('reheat')) {
    range = SAFE_TEMP_RANGES.reheat;
  }
  
  if (!range) return false;
  
  return temp < range.min || temp > range.max;
};

/**
 * Get safe temperature range description for an item
 */
export const getSafeRangeDescription = (itemName: string): string | null => {
  const nameLower = itemName.toLowerCase();
  let range: { min: number; max: number } | undefined;
  
  if (nameLower.includes('ψυγείο') || nameLower.includes('fridge')) {
    range = SAFE_TEMP_RANGES.fridge;
  } else if (nameLower.includes('καταψύκτ') || nameLower.includes('freezer')) {
    range = SAFE_TEMP_RANGES.freezer;
  } else if (nameLower.includes('ζεστό') || nameLower.includes('hot')) {
    range = SAFE_TEMP_RANGES.hot_hold;
  } else if (nameLower.includes('κοτόπουλο') || nameLower.includes('poultry')) {
    range = SAFE_TEMP_RANGES.poultry;
  } else if (nameLower.includes('κιμά') || nameLower.includes('ground')) {
    range = SAFE_TEMP_RANGES.ground_meat;
  } else if (nameLower.includes('ψάρι') || nameLower.includes('fish')) {
    range = SAFE_TEMP_RANGES.fish;
  }
  
  if (!range) return null;
  
  return `${range.min}°C - ${range.max}°C`;
};

/**
 * Calculate next check due time based on frequency
 */
export const calculateNextCheckDue = (
  frequency: HaccpReminder['frequency'],
  lastCheckTime: Date = new Date()
): Date => {
  const next = new Date(lastCheckTime);
  
  switch (frequency) {
    case 'hourly':
      next.setHours(next.getHours() + 1);
      break;
    case 'every_2_hours':
      next.setHours(next.getHours() + 2);
      break;
    case 'every_4_hours':
      next.setHours(next.getHours() + 4);
      break;
    case 'daily':
      next.setDate(next.getDate() + 1);
      break;
    case 'weekly':
      next.setDate(next.getDate() + 7);
      break;
  }
  
  return next;
};

/**
 * Check if a reminder is overdue
 */
export const isReminderOverdue = (reminder: HaccpReminder): boolean => {
  if (!reminder.nextCheckDue) return false;
  return new Date() > new Date(reminder.nextCheckDue);
};

/**
 * Get all overdue reminders
 */
export const getOverdueReminders = (reminders: HaccpReminder[]): HaccpReminder[] => {
  return reminders.filter(isReminderOverdue);
};

/**
 * Get non-compliant logs (out of range temperatures)
 */
export const getNonCompliantLogs = (
  logs: HaccpLog[],
  items: HaccpItem[]
): HaccpLog[] => {
  return logs.filter(log => {
    const item = items.find(i => i.id === log.haccpItemId);
    if (!item) return false;
    return isTemperatureOutOfRange(log.value, item.name);
  });
};

/**
 * Calculate compliance score (percentage of logs within range)
 */
export const calculateComplianceScore = (
  logs: HaccpLog[],
  items: HaccpItem[]
): number => {
  if (logs.length === 0) return 100;
  
  const nonCompliantCount = getNonCompliantLogs(logs, items).length;
  return Math.round(((logs.length - nonCompliantCount) / logs.length) * 100);
};

/**
 * Analyze temperature trends for an item
 */
export const analyzeTemperatureTrends = (
  logs: HaccpLog[],
  haccpItemId: string
): {
  average: number;
  min: number;
  max: number;
  trend: 'stable' | 'rising' | 'falling';
  outOfRangeCount: number;
} => {
  const itemLogs = logs
    .filter(log => log.haccpItemId === haccpItemId && log.value)
    .map(log => ({ ...log, temp: parseFloat(log.value!) }))
    .filter(log => !isNaN(log.temp))
    .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
  
  if (itemLogs.length === 0) {
    return { average: 0, min: 0, max: 0, trend: 'stable', outOfRangeCount: 0 };
  }
  
  const temps = itemLogs.map(l => l.temp);
  const average = temps.reduce((sum, t) => sum + t, 0) / temps.length;
  const min = Math.min(...temps);
  const max = Math.max(...temps);
  
  // Simple trend detection: compare first half average to second half average
  const midpoint = Math.floor(temps.length / 2);
  const firstHalfAvg = temps.slice(0, midpoint).reduce((sum, t) => sum + t, 0) / midpoint;
  const secondHalfAvg = temps.slice(midpoint).reduce((sum, t) => sum + t, 0) / (temps.length - midpoint);
  
  let trend: 'stable' | 'rising' | 'falling' = 'stable';
  const diff = secondHalfAvg - firstHalfAvg;
  if (diff > 2) trend = 'rising';
  else if (diff < -2) trend = 'falling';
  
  const outOfRangeCount = itemLogs.filter(log => log.isOutOfRange).length;
  
  return { average, min, max, trend, outOfRangeCount };
};

/**
 * Get logs for a specific time period
 */
export const getLogsInPeriod = (
  logs: HaccpLog[],
  startDate: Date,
  endDate: Date
): HaccpLog[] => {
  return logs.filter(log => {
    const logDate = new Date(log.timestamp);
    return logDate >= startDate && logDate <= endDate;
  });
};

/**
 * Get missing checks (items that should have been checked but weren't)
 */
export const getMissingChecks = (
  reminders: HaccpReminder[],
  logs: HaccpLog[],
  periodHours: number = 24
): { reminder: HaccpReminder; hoursSinceLastCheck: number }[] => {
  const now = new Date();
  const cutoff = new Date(now.getTime() - periodHours * 60 * 60 * 1000);
  
  return reminders
    .map(reminder => {
      const recentLogs = logs.filter(
        log => log.haccpItemId === reminder.haccpItemId &&
               new Date(log.timestamp) >= cutoff
      );
      
      if (recentLogs.length === 0) {
        const lastLog = logs
          .filter(log => log.haccpItemId === reminder.haccpItemId)
          .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())[0];
        
        const hoursSinceLastCheck = lastLog
          ? (now.getTime() - new Date(lastLog.timestamp).getTime()) / (1000 * 60 * 60)
          : periodHours;
        
        return { reminder, hoursSinceLastCheck };
      }
      
      return null;
    })
    .filter((item): item is { reminder: HaccpReminder; hoursSinceLastCheck: number } => item !== null);
};
