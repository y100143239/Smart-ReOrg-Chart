import React, { useState, useEffect } from 'react';
import type { Candidate, Skill } from '../types';
import { XIcon } from './Icons';

interface CandidateModalProps {
    candidate: Candidate;
    onClose: () => void;
}

export const CandidateModal: React.FC<CandidateModalProps> = ({ candidate, onClose }) => {
    const [localTime, setLocalTime] = useState('');

    useEffect(() => {
        const updateLocalTime = () => {
            try {
                const time = new Date().toLocaleTimeString('en-US', {
                    timeZone: candidate.timeZone,
                    hour: '2-digit',
                    minute: '2-digit',
                    hour12: true,
                });
                setLocalTime(time);
            } catch (e) {
                console.error(`Invalid time zone: ${candidate.timeZone}`);
                setLocalTime('Invalid Timezone');
            }
        };

        updateLocalTime();
        const intervalId = setInterval(updateLocalTime, 1000);

        return () => clearInterval(intervalId);
    }, [candidate.timeZone]);

    const proficiencyColors: Record<Skill['proficiency'], string> = {
        'Expert': 'bg-purple-100 text-purple-800',
        'Advanced': 'bg-indigo-100 text-indigo-800',
        'Intermediate': 'bg-blue-100 text-blue-800',
        'Beginner': 'bg-yellow-100 text-yellow-800',
    };

    return (
        <div 
            className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 transition-opacity"
            onClick={onClose}
            role="dialog"
            aria-modal="true"
            aria-labelledby="candidate-modal-title"
        >
            <div 
                className="bg-white rounded-xl shadow-2xl p-8 w-full max-w-lg m-4 transform transition-all"
                onClick={e => e.stopPropagation()} // Prevent clicks inside the modal from closing it
            >
                <div className="flex justify-between items-start mb-6">
                    <div className="flex items-center space-x-4">
                        <img src={candidate.avatarUrl} alt={candidate.name} className="w-24 h-24 rounded-full border-4 border-gray-200" />
                        <div>
                            <h2 id="candidate-modal-title" className="text-3xl font-bold text-gray-900">{candidate.name}</h2>
                            <p className="text-lg text-gray-600">{candidate.role}</p>
                            <p className="text-md text-gray-500 bg-gray-100 px-2 py-1 rounded inline-block mt-1">
                                Current Team: <span className="font-semibold">{candidate.currentTeam}</span>
                            </p>
                        </div>
                    </div>
                    <button 
                        onClick={onClose} 
                        className="text-gray-400 hover:text-gray-600 transition-colors"
                        aria-label="Close candidate details"
                    >
                        <XIcon className="w-7 h-7" />
                    </button>
                </div>

                <div className="space-y-6">
                     <div>
                        <h3 className="text-xl font-semibold text-gray-800 border-b pb-2 mb-3">Details</h3>
                        <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-gray-600">
                             <p><span className="font-semibold">Experience:</span> {candidate.experience} years</p>
                             <p><span className="font-semibold">Education:</span> {candidate.education}</p>
                             <p><span className="font-semibold">Location:</span> {candidate.location}</p>
                             <p><span className="font-semibold">Local Time:</span> {localTime}</p>
                             <p className="col-span-2"><span className="font-semibold">Email:</span> {candidate.email}</p>
                        </div>
                    </div>

                    <div>
                        <h3 className="text-xl font-semibold text-gray-800 border-b pb-2 mb-3">Skills & Proficiency</h3>
                        <div className="flex flex-wrap gap-2">
                            {candidate.skills.map(skill => (
                                <div key={skill.name} className={`px-3 py-1.5 text-sm font-medium rounded-full flex items-baseline ${proficiencyColors[skill.proficiency]}`}>
                                    <span>{skill.name}</span>
                                    <span className="font-normal opacity-75 ml-1.5 text-xs">({skill.proficiency})</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div>
                        <h3 className="text-xl font-semibold text-gray-800 border-b pb-2 mb-3">Key Achievements</h3>
                        <ul className="space-y-2 text-gray-600 list-disc list-inside">
                            {candidate.achievements.map((achievement, index) => (
                                <li key={index}>{achievement}</li>
                            ))}
                        </ul>
                    </div>
                </div>

                <div className="mt-8 text-right">
                    <button 
                        onClick={onClose} 
                        className="bg-gray-600 text-white font-bold py-2 px-6 rounded-lg hover:bg-gray-700 transition-all"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
};