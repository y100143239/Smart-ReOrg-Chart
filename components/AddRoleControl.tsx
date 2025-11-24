import React, { useState } from 'react';
import { PlusIcon } from './Icons';

interface AddRoleControlProps {
    onAddRole: (title: string) => void;
}

export const AddRoleControl: React.FC<AddRoleControlProps> = ({ onAddRole }) => {
    const [isAdding, setIsAdding] = useState(false);
    const [newRoleTitle, setNewRoleTitle] = useState('');

    const handleAdd = () => {
        if (newRoleTitle.trim()) {
            onAddRole(newRoleTitle.trim());
            setNewRoleTitle('');
            setIsAdding(false);
        }
    };
    
    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            handleAdd();
        } else if (e.key === 'Escape') {
            setIsAdding(false);
            setNewRoleTitle('');
        }
    };

    if (!isAdding) {
        return (
            <button
                onClick={() => setIsAdding(true)}
                className="border-2 border-dashed border-gray-300 rounded-lg p-4 h-full flex flex-col justify-center items-center text-gray-500 hover:border-indigo-500 hover:text-indigo-600 transition-colors"
            >
                <PlusIcon className="w-8 h-8" />
                <span className="mt-2 font-semibold">Add Position</span>
            </button>
        );
    }

    return (
        <div className="border-2 border-indigo-400 bg-indigo-50 rounded-lg p-4 h-full flex flex-col justify-center items-center">
            <input
                type="text"
                value={newRoleTitle}
                onChange={(e) => setNewRoleTitle(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="New position title..."
                autoFocus
                className="w-full p-2 border border-gray-300 rounded-md text-sm mb-2"
            />
            <div className="flex gap-2 w-full">
                <button
                    onClick={handleAdd}
                    className="flex-1 bg-indigo-600 text-white font-bold py-2 px-3 rounded-md text-sm"
                >
                    Add
                </button>
                <button
                    onClick={() => { setIsAdding(false); setNewRoleTitle(''); }}
                    className="flex-1 bg-gray-200 text-gray-700 font-bold py-2 px-3 rounded-md text-sm"
                >
                    Cancel
                </button>
            </div>
        </div>
    );
};