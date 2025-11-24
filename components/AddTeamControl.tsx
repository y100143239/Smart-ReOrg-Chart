import React, { useState } from 'react';
import { TeamIcon } from './Icons';

interface AddTeamControlProps {
    onAddTeam: (title: string) => void;
}

export const AddTeamControl: React.FC<AddTeamControlProps> = ({ onAddTeam }) => {
    const [isAdding, setIsAdding] = useState(false);
    const [newTeamTitle, setNewTeamTitle] = useState('');

    const handleAdd = () => {
        if (newTeamTitle.trim()) {
            onAddTeam(newTeamTitle.trim());
            setNewTeamTitle('');
            setIsAdding(false);
        }
    };
    
    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') handleAdd();
        else if (e.key === 'Escape') {
            setIsAdding(false);
            setNewTeamTitle('');
        }
    };

    if (!isAdding) {
        return (
            <button
                onClick={() => setIsAdding(true)}
                className="w-full border-2 border-dashed border-gray-300 rounded-lg p-6 flex flex-col justify-center items-center text-gray-500 hover:border-indigo-500 hover:text-indigo-600 transition-colors"
            >
                <TeamIcon className="w-10 h-10" />
                <span className="mt-2 font-semibold text-lg">Add New Team</span>
            </button>
        );
    }

    return (
        <div className="w-full border-2 border-indigo-400 bg-indigo-50 rounded-lg p-6 flex flex-col justify-center items-center">
            <h3 className="font-semibold text-gray-700 mb-3">New Team Title:</h3>
            <input
                type="text"
                value={newTeamTitle}
                onChange={(e) => setNewTeamTitle(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="e.g., 'Product Division'"
                autoFocus
                className="w-full max-w-sm p-2 border border-gray-300 rounded-md mb-3"
            />
            <div className="flex gap-3">
                <button onClick={handleAdd} className="bg-indigo-600 text-white font-bold py-2 px-6 rounded-md">
                    Add Team
                </button>
                <button onClick={() => setIsAdding(false)} className="bg-gray-200 text-gray-700 font-bold py-2 px-6 rounded-md">
                    Cancel
                </button>
            </div>
        </div>
    );
};