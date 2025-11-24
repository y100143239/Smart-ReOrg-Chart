import React from 'react';
import type { User } from '../types';
import { UserCircleIcon } from './Icons';

interface UserSwitcherProps {
    users: User[];
    currentUser: User;
    onUserChange: (userId: string) => void;
}

export const UserSwitcher: React.FC<UserSwitcherProps> = ({ users, currentUser, onUserChange }) => {
    return (
        <div className="flex items-center space-x-2">
            <UserCircleIcon className="w-6 h-6 text-gray-500" />
            <label htmlFor="user-switcher" className="text-sm font-medium text-gray-600 sr-only">
                Current User:
            </label>
            <select
                id="user-switcher"
                value={currentUser.id}
                onChange={(e) => onUserChange(e.target.value)}
                className="p-2 border border-gray-300 rounded-md bg-white text-sm font-semibold text-gray-700 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            >
                {users.map(user => (
                    <option key={user.id} value={user.id}>
                        {user.name}
                    </option>
                ))}
            </select>
        </div>
    );
};