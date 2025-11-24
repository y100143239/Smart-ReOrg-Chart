import React from 'react';
import type { ProgressStep } from '../types';
import { LoadingSpinner, CheckCircleIcon, CircleIcon } from './Icons';

interface ProcessTrackerProps {
    steps: ProgressStep[];
    isComplete: boolean;
    title: string;
}

const StatusIcon: React.FC<{ status: ProgressStep['status'] }> = ({ status }) => {
    switch (status) {
        case 'pending':
            return <CircleIcon className="w-5 h-5 text-gray-300" />;
        case 'in-progress':
            return <LoadingSpinner />;
        case 'complete':
            return <CheckCircleIcon className="w-5 h-5 text-green-500" />;
        default:
            return null;
    }
};

export const ProcessTracker: React.FC<ProcessTrackerProps> = ({ steps, isComplete, title }) => {
    const finalTitle = isComplete ? title.replace('...', ' Log').replace('Process', 'Process Log') : title;
    
    return (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">
                {finalTitle}
            </h3>
            <ul className="space-y-3">
                {steps.map(step => {
                    const textClass = step.status === 'in-progress' 
                        ? 'text-gray-800 font-semibold' 
                        : step.status === 'complete' 
                        ? isComplete ? 'text-gray-600' : 'text-gray-500' 
                        : 'text-gray-400';
                    
                    const isSubStep = step.isSubStep ?? false;
                    
                    return (
                        <li key={step.id} className={`flex items-center space-x-3 transition-colors duration-300 ${isSubStep ? 'pl-6' : ''}`}>
                            <div className="flex-shrink-0">
                                <StatusIcon status={step.status} />
                            </div>
                            <span className={`text-sm ${textClass}`}>{step.label}</span>
                        </li>
                    );
                })}
            </ul>
        </div>
    );
};