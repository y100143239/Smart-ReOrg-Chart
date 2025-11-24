import React from 'react';
import type { AppPhase } from '../types';
import { LightbulbIcon, CheckCircleIcon, RocketLaunchIcon } from './Icons';

interface StepperProps {
    currentPhase: AppPhase;
}

const phases: { id: AppPhase; label: string; Icon: React.FC<{className?: string}> }[] = [
    { id: 'planning', label: 'Plan', Icon: LightbulbIcon },
    { id: 'approval', label: 'Approve', Icon: CheckCircleIcon },
    { id: 'execution', label: 'Execute', Icon: RocketLaunchIcon },
];

export const Stepper: React.FC<StepperProps> = ({ currentPhase }) => {
    const currentIndex = phases.findIndex(p => p.id === currentPhase);

    return (
        <div className="bg-white shadow-md sticky top-[80px] z-20">
            <nav aria-label="Progress" className="px-6 py-4">
                <ol role="list" className="flex items-center">
                    {phases.map((phase, phaseIdx) => (
                        <li key={phase.label} className={`relative ${phaseIdx !== phases.length - 1 ? 'flex-1' : ''}`}>
                            {phaseIdx < currentIndex ? ( // Completed step
                                <>
                                    <div className="absolute inset-0 flex items-center" aria-hidden="true">
                                        <div className="h-0.5 w-full bg-indigo-600" />
                                    </div>
                                    <div className="relative flex h-8 w-8 items-center justify-center rounded-full bg-indigo-600">
                                        <CheckCircleIcon className="h-5 w-5 text-white" />
                                    </div>
                                    <span className="absolute -bottom-6 text-xs font-semibold text-indigo-600">{phase.label}</span>
                                </>
                            ) : phaseIdx === currentIndex ? ( // Current step
                                <>
                                    <div className="absolute inset-0 flex items-center" aria-hidden="true">
                                        <div className="h-0.5 w-full bg-gray-200" />
                                    </div>
                                    <div className="relative flex h-8 w-8 items-center justify-center rounded-full border-2 border-indigo-600 bg-white">
                                        <phase.Icon className="h-5 w-5 text-indigo-600" />
                                    </div>
                                    <span className="absolute -bottom-6 text-xs font-semibold text-indigo-600">{phase.label}</span>
                                </>
                            ) : ( // Upcoming step
                                <>
                                    <div className="absolute inset-0 flex items-center" aria-hidden="true">
                                        <div className="h-0.5 w-full bg-gray-200" />
                                    </div>
                                    <div className="relative flex h-8 w-8 items-center justify-center rounded-full border-2 border-gray-300 bg-white">
                                        <phase.Icon className="h-5 w-5 text-gray-400" />
                                    </div>
                                    <span className="absolute -bottom-6 text-xs font-medium text-gray-500">{phase.label}</span>
                                </>
                            )}
                        </li>
                    ))}
                </ol>
            </nav>
        </div>
    );
};