import React from 'react';
import { XCircleIcon } from './Icons';

export interface CandidateFilters {
    skill: string;
    minExperience: number;
    maxExperience: number;
    team: string;
}

interface CandidateFilterProps {
    filters: CandidateFilters;
    onFilterChange: (newFilters: Partial<CandidateFilters>) => void;
    allTeams: string[];
    maxExperience: number;
}

export const CandidateFilter: React.FC<CandidateFilterProps> = ({
    filters,
    onFilterChange,
    allTeams,
    maxExperience,
}) => {
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        onFilterChange({ [name]: name.includes('Experience') ? parseInt(value, 10) : value });
    };

    const handleReset = () => {
        onFilterChange({
            skill: '',
            minExperience: 0,
            maxExperience: maxExperience,
            team: '',
        });
    };

    const inputClasses = "w-full p-2 border border-gray-300 rounded-md bg-white text-sm focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 transition-shadow";
    const labelClasses = "block text-xs font-medium text-gray-600 mb-1";
    
    return (
        <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
                {/* Skill Filter */}
                <div>
                    <label htmlFor="skill" className={labelClasses}>Filter by Skill</label>
                    <input
                        type="text"
                        id="skill"
                        name="skill"
                        value={filters.skill}
                        onChange={handleInputChange}
                        placeholder="e.g., TypeScript"
                        className={inputClasses}
                    />
                </div>

                {/* Experience Filter */}
                <div className="flex gap-2">
                    <div className="flex-1">
                        <label htmlFor="minExperience" className={labelClasses}>Min Exp (yrs)</label>
                        <input
                            type="number"
                            id="minExperience"
                            name="minExperience"
                            value={filters.minExperience}
                            onChange={handleInputChange}
                            min="0"
                            max={maxExperience}
                            className={inputClasses}
                        />
                    </div>
                    <div className="flex-1">
                        <label htmlFor="maxExperience" className={labelClasses}>Max Exp (yrs)</label>
                        <input
                            type="number"
                            id="maxExperience"
                            name="maxExperience"
                            value={filters.maxExperience}
                            onChange={handleInputChange}
                            min="0"
                            max={maxExperience}
                            className={inputClasses}
                        />
                    </div>
                </div>

                {/* Team Filter */}
                <div>
                    <label htmlFor="team" className={labelClasses}>Filter by Current Team</label>
                    <select
                        id="team"
                        name="team"
                        value={filters.team}
                        onChange={handleInputChange}
                        className={inputClasses}
                    >
                        <option value="">All Teams</option>
                        {allTeams.map(team => (
                            <option key={team} value={team}>{team}</option>
                        ))}
                    </select>
                </div>

                {/* Reset Button */}
                <div className="sm:col-span-2 lg:col-span-1">
                     <button
                        onClick={handleReset}
                        className="w-full flex items-center justify-center gap-2 bg-gray-200 text-gray-700 font-semibold py-2 px-3 rounded-md hover:bg-gray-300 transition-colors text-sm"
                    >
                        <XCircleIcon className="w-4 h-4" />
                        Reset Filters
                    </button>
                </div>
            </div>
        </div>
    );
};