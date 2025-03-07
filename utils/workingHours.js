import { DateTime } from 'luxon';

export function isWithinWorkingHours(settings) {
    if (!settings.workingHours.enabled) return true;

    const now = DateTime.now().setZone(settings.workingHours.timeZone);
    const startTime = DateTime.fromFormat(settings.workingHours.start, 'HH:mm', { zone: settings.workingHours.timeZone });
    const endTime = DateTime.fromFormat(settings.workingHours.end, 'HH:mm', { zone: settings.workingHours.timeZone });

    // Set the date components of start and end times to today
    startTime.set({ year: now.year, month: now.month, day: now.day });
    endTime.set({ year: now.year, month: now.month, day: now.day });

    // If end time is before start time, it means it's overnight
    if (endTime < startTime) {
        endTime.plus({ days: 1 });
    }

    return now >= startTime && now <= endTime;
}

export function getNextWorkingHours(settings) {
    const now = DateTime.now().setZone(settings.workingHours.timeZone);
    const startTime = DateTime.fromFormat(settings.workingHours.start, 'HH:mm', { zone: settings.workingHours.timeZone });
    const endTime = DateTime.fromFormat(settings.workingHours.end, 'HH:mm', { zone: settings.workingHours.timeZone });

    // Set the date components of start and end times to today
    startTime.set({ year: now.year, month: now.month, day: now.day });
    endTime.set({ year: now.year, month: now.month, day: now.day });

    // If we're past end time, next working hours start tomorrow
    if (now > endTime) {
        startTime.plus({ days: 1 });
        endTime.plus({ days: 1 });
    }
    // If we're before start time, next working hours start today
    else if (now < startTime) {
        // Already set to today
    }
    // If we're within working hours, next working hours start tomorrow
    else {
        startTime.plus({ days: 1 });
        endTime.plus({ days: 1 });
    }

    return {
        start: startTime,
        end: endTime
    };
} 