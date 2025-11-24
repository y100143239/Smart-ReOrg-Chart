import React, { useMemo } from 'react';
// FIX: Import `TeamData` and `TeamSlotData` for explicit typing.
import type { OrgStructure, User, TeamData, TeamSlotData } from '../types';

interface TimeZoneHelperProps {
    orgStructure: OrgStructure;
    currentUser: User;
}

interface TimeZoneInfo {
    timeZone: string;
    offset: number; // in hours from UTC
    locations: string[];
}

const getUtcOffset = (timeZone: string): number => {
    try {
        const date = new Date();
        const utcDate = new Date(date.toLocaleString('en-US', { timeZone: 'UTC' }));
        const tzDate = new Date(date.toLocaleString('en-US', { timeZone }));
        return (tzDate.getTime() - utcDate.getTime()) / (1000 * 60 * 60);
    } catch (e) {
        return 0; // Fallback for invalid timezones
    }
};

const formatOffset = (offset: number): string => {
    const sign = offset >= 0 ? '+' : '-';
    const hours = Math.floor(Math.abs(offset));
    return `UTC${sign}${hours}`;
};

export const TimeZoneHelper: React.FC<TimeZoneHelperProps> = ({ orgStructure, currentUser }) => {
    const timeZoneData = useMemo(() => {
        // FIX: Add explicit types for `team` and `role` to resolve property access errors.
        const candidates = Object.values(orgStructure).flatMap((team: TeamData) =>
            Object.values(team.roles).map((role: TeamSlotData) => role.candidate)
        ).filter(Boolean);

        const timeZones: Record<string, { locations: Set<string>, offset: number }> = {};

        candidates.forEach(c => {
            if (c) {
                if (!timeZones[c.timeZone]) {
                    timeZones[c.timeZone] = {
                        locations: new Set(),
                        offset: getUtcOffset(c.timeZone),
                    };
                }
                timeZones[c.timeZone].locations.add(c.location.split(',')[0]);
            }
        });

        return Object.entries(timeZones)
            .map(([tz, data]) => ({
                timeZone: tz,
                offset: data.offset,
                locations: Array.from(data.locations),
            }))
            .sort((a, b) => a.offset - b.offset);

    }, [orgStructure]);

    const coreOverlap = useMemo(() => {
        if (timeZoneData.length < 2) return { start: 9, end: 17 };

        let maxStart = -Infinity;
        let minEnd = Infinity;

        timeZoneData.forEach(tz => {
            const startInUTC = 9 - tz.offset;
            const endInUTC = 17 - tz.offset;
            if (startInUTC > maxStart) maxStart = startInUTC;
            if (endInUTC < minEnd) minEnd = endInUTC;
        });
        
        const userOffset = getUtcOffset(currentUser.timeZone);
        const overlapStart = (maxStart + userOffset + 24) % 24;
        const overlapEnd = (minEnd + userOffset + 24) % 24;

        return { start: overlapStart, end: overlapEnd };
    }, [timeZoneData, currentUser.timeZone]);
    
    // FIX: Changed `overlap` to `coreOverlap` to match the defined variable.
    const overlapDuration = coreOverlap.end > coreOverlap.start ? coreOverlap.end - coreOverlap.start : 0;

    const currentUserOffset = getUtcOffset(currentUser.timeZone);

    if (timeZoneData.length === 0) {
        return null;
    }

    return (
        <div className="bg-gray-50 p-4 rounded-xl shadow-sm border border-gray-200">
            <h4 className="text-md font-semibold text-gray-800 mb-3">Team Time Zone Helper</h4>
            
            <div className="space-y-3">
                {timeZoneData.map(tz => {
                    const startHour = 9; // 9 AM
                    const workDuration = 8; // 8 hours
                    const userTimeStart = (startHour - tz.offset + currentUserOffset + 24) % 24;
                    
                    return (
                        <div key={tz.timeZone}>
                            <div className="flex justify-between items-center text-sm mb-1">
                                <span className="font-medium text-gray-700">{tz.locations.join(', ')}</span>
                                <span className="text-xs text-gray-500 font-mono">{formatOffset(tz.offset)}</span>
                            </div>
                            <div className="w-full h-6 bg-gray-200 rounded-full relative">
                                <div 
                                    className="absolute h-full bg-indigo-500 rounded-full"
                                    style={{ 
                                        left: `${(userTimeStart / 24) * 100}%`,
                                        width: `${(workDuration / 24) * 100}%`
                                    }}
                                    title={`Working hours: 9 AM - 5 PM in ${tz.timeZone}`}
                                />
                            </div>
                        </div>
                    );
                })}
            </div>

            <div className="mt-4 border-t pt-3">
                 <div className="text-sm font-medium text-gray-700 mb-1">Timeline (Your Local Time: {formatOffset(currentUserOffset)})</div>
                 <div className="w-full h-6 bg-gray-200 rounded-full relative">
                      {overlapDuration > 0 && (
                         <div
                             className="absolute h-full bg-green-500 rounded-full flex items-center justify-center text-white text-xs font-bold"
                             style={{
                                 // FIX: Changed `overlap` to `coreOverlap` to match the defined variable.
                                 left: `${(coreOverlap.start / 24) * 100}%`,
                                 width: `${(overlapDuration / 24) * 100}%`
                             }}
                             // FIX: Changed `overlap` to `coreOverlap` to match the defined variable.
                             title={`Core overlap hours: ${Math.floor(coreOverlap.start)}:00 - ${Math.floor(coreOverlap.end)}:00`}
                         >
                            {overlapDuration.toFixed(1)}h
                         </div>
                     )}
                     <div className="absolute w-full flex justify-between text-xs -bottom-4 px-1 text-gray-500">
                         <span>12AM</span>
                         <span>6AM</span>
                         <span>12PM</span>
                         <span>6PM</span>
                     </div>
                 </div>
                 <p className="text-center text-sm font-semibold text-gray-800 mt-6">
                     Core Overlap: <span className="text-green-600">{overlapDuration.toFixed(1)} hours</span>
                 </p>
            </div>
        </div>
    );
};