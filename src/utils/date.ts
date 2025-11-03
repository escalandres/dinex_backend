// utils/date.ts

export function formatDateISO(date: Date): string {
    return date.toISOString().split('.')[0] + 'Z';
}

export function getMonthBoundaries(): { start: Date; end: Date } {
    const now = new Date();
    const start = new Date(now.getFullYear(), now.getMonth(), 1);
    const end = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
    return { start, end };
}

export function isDateInCurrentMonth(date: Date): boolean {
    const { start, end } = getMonthBoundaries();
    return date >= start && date <= end;
}

export function differenceInDays(dateA: Date, dateB: Date): number {
    const msPerDay = 1000 * 60 * 60 * 24;
    const utcA = Date.UTC(dateA.getFullYear(), dateA.getMonth(), dateA.getDate());
    const utcB = Date.UTC(dateB.getFullYear(), dateB.getMonth(), dateB.getDate());
    return Math.floor((utcA - utcB) / msPerDay);
}

export function addDays(date: Date, days: number): Date {
    const result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
}

export function getNextOccurrence(start: Date, frequencyDays: number): Date {
    const { start: startOfMonth } = getMonthBoundaries();
    const daysDiff = differenceInDays(startOfMonth, start);
    const cycles = Math.floor(daysDiff / frequencyDays);
    return addDays(start, cycles * frequencyDays);
}

export function isIncomeInCurrentMonth(applicationDate: string, frequencyDays: number): boolean {
    const start = new Date(applicationDate);
    if (isNaN(start.getTime())) return false;

    if (frequencyDays === 0) {
        return isDateInCurrentMonth(start);
    }

    const next = getNextOccurrence(start, frequencyDays);
    return isDateInCurrentMonth(next);
}