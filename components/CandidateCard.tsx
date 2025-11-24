import React from 'react';
import type { Candidate } from '../types';

interface CandidateCardProps {
    candidate: Candidate;
    isDraggable?: boolean;
    onClick?: (candidate: Candidate) => void;
}

export const CandidateCard: React.FC<CandidateCardProps> = ({ candidate, isDraggable = true, onClick }) => {
    
    const handleDragStart = (e: React.DragEvent<HTMLDivElement>) => {
        if (!isDraggable) {
            e.preventDefault();
            return;
        }
        e.dataTransfer.setData("application/json", JSON.stringify({ candidateId: candidate.id }));
        e.dataTransfer.effectAllowed = 'move';
    };
    
    const handleCardClick = () => {
        if (onClick) {
            onClick(candidate);
        }
    }

    const cursorClass = onClick ? 'cursor-pointer' : 'cursor-default';
    const draggableCursorClass = isDraggable ? 'cursor-grab active:cursor-grabbing' : cursorClass;

    return (
        <div
            draggable={isDraggable}
            onDragStart={handleDragStart}
            onClick={handleCardClick}
            className={`bg-white rounded-xl p-3 shadow-sm border border-gray-200 ${draggableCursorClass} hover:ring-2 hover:ring-offset-1 hover:ring-indigo-500 transition-all duration-200`}
            role={onClick ? 'button' : undefined}
            tabIndex={onClick ? 0 : -1}
            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') handleCardClick()}}
        >
            <div className="flex items-center space-x-3">
                <img src={candidate.avatarUrl} alt={candidate.name} className="w-12 h-12 rounded-full" />
                <div>
                    <p className="font-bold text-gray-800 text-sm">{candidate.name}</p>
                    <p className="text-xs text-gray-500">{candidate.role}</p>
                </div>
            </div>
            <div className="mt-3">
                <p className="text-xs text-gray-600 font-medium">Skills:</p>
                <div className="flex flex-wrap gap-1 mt-1">
                    {candidate.skills.slice(0, 3).map(skill => (
                        <span key={skill.name} className="px-2 py-0.5 text-xs bg-indigo-100 text-indigo-800 rounded-full">{skill.name}</span>
                    ))}
                    {candidate.skills.length > 3 && (
                        <span className="px-2 py-0.5 text-xs bg-gray-200 text-gray-600 rounded-full">+{candidate.skills.length - 3}</span>
                    )}
                </div>
            </div>
        </div>
    );
};