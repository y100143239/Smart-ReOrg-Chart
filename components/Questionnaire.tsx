import React, { useState, useEffect } from 'react';
// FIX: Import `ExistingTeam` to use for explicit typing.
import type { QuestionnaireData, ReorgPurpose, ExistingTeams, ExistingTeam } from '../types';
import { SubmitIcon } from './Icons';

interface QuestionnaireProps {
    onSubmit: (data: QuestionnaireData) => void;
    onChange: (data: QuestionnaireData) => void;
    isLoading: boolean;
    disabled: boolean;
    existingTeams: ExistingTeams;
}

export const Questionnaire: React.FC<QuestionnaireProps> = ({ onSubmit, onChange, isLoading, disabled, existingTeams }) => {
    const [formData, setFormData] = useState<QuestionnaireData>({
        userPosition: 'Business Department Manager',
        reorgPurpose: 'organize_new',
        teamPurpose: 'Develop a new customer-facing analytics dashboard',
        neededSkills: 'React, TypeScript, Data Visualization, UI/UX Design, Node.js, SQL',
        neededExperience: 'A mix of senior and mid-level engineers, with at least one senior lead'
    });

    useEffect(() => {
        onChange(formData);
    }, [formData, onChange]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        
        setFormData(prev => {
            const newState = { ...prev, [name]: value };
            // If purpose changes, reset target team
            if (name === 'reorgPurpose') {
                delete newState.targetTeamId;
                const isSingleTeamPurpose = value === 'expand_existing' || value === 'restructure_existing';
                if(isSingleTeamPurpose && Object.keys(existingTeams).length > 0){
                    newState.targetTeamId = Object.keys(existingTeams)[0];
                }
            }
            return newState;
        });
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit(formData);
    };

    const inputClasses = "w-full p-2 border border-gray-300 rounded-md bg-gray-50 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-shadow disabled:bg-gray-200 disabled:cursor-not-allowed";
    const labelClasses = "block text-sm font-medium text-gray-600 mb-1";
    const isTeamSelectionRequired = formData.reorgPurpose === 'expand_existing' || formData.reorgPurpose === 'restructure_existing';

    return (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <h2 className="text-2xl font-semibold mb-4 text-gray-800 border-b pb-3">Reorganization Goals</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
                <fieldset disabled={disabled} className="space-y-4">
                    <div>
                        <label htmlFor="userPosition" className={labelClasses}>What's your position?</label>
                        <select id="userPosition" name="userPosition" value={formData.userPosition} onChange={handleChange} className={inputClasses}>
                            <option>HR Manager</option>
                            <option>Business Department Manager</option>
                            <option>Project Team Leader</option>
                        </select>
                    </div>
                    <div>
                        <label htmlFor="reorgPurpose" className={labelClasses}>What's the scope of the reorg?</label>
                        <select id="reorgPurpose" name="reorgPurpose" value={formData.reorgPurpose} onChange={handleChange} className={inputClasses}>
                            <option value="organize_new">Organize a new team</option>
                            <option value="expand_existing">Expand an existing team</option>
                            <option value="restructure_existing">Restructure an existing team</option>
                             <option value="restructure_multiple">Restructure Multiple Teams / Depts</option>
                        </select>
                    </div>
                    
                    {isTeamSelectionRequired && (
                         <div>
                            <label htmlFor="targetTeamId" className={labelClasses}>Which team?</label>
                            <select id="targetTeamId" name="targetTeamId" value={formData.targetTeamId || ''} onChange={handleChange} className={inputClasses} required>
                                {Object.keys(existingTeams).length === 0 ? (
                                    <option disabled>No teams available</option>
                                ) : (
                                    // FIX: Add explicit type `ExistingTeam` for the `team` parameter to resolve unknown property access.
                                    Object.entries(existingTeams).map(([id, team]: [string, ExistingTeam]) => (
                                        <option key={id} value={id}>{team.title}</option>
                                    ))
                                )}
                            </select>
                        </div>
                    )}

                    <div>
                        <label htmlFor="teamPurpose" className={labelClasses}>What's the primary goal?</label>
                        <input type="text" id="teamPurpose" name="teamPurpose" value={formData.teamPurpose} onChange={handleChange} className={inputClasses} />
                    </div>
                    <div>
                        <label htmlFor="neededSkills" className={labelClasses}>What kind of skills are needed?</label>
                        <input type="text" id="neededSkills" name="neededSkills" value={formData.neededSkills} onChange={handleChange} className={inputClasses} placeholder="e.g., React, Python, Figma" />
                    </div>
                    <div>
                        <label htmlFor="neededExperience" className={labelClasses}>What kind of experience is needed?</label>
                        <input type="text" id="neededExperience" name="neededExperience" value={formData.neededExperience} onChange={handleChange} className={inputClasses} placeholder="e.g., Senior lead, 5+ years" />
                    </div>
                </fieldset>
                <button
                    type="submit"
                    disabled={isLoading || disabled || (isTeamSelectionRequired && !formData.targetTeamId)}
                    className="w-full flex items-center justify-center gap-2 bg-indigo-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-gray-400 disabled:cursor-not-allowed transition-all"
                >
                    <SubmitIcon />
                    {isLoading ? 'Thinking...' : 'Get AI Suggestions'}
                </button>
            </form>
        </div>
    );
};