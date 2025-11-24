import React from 'react';
import type { Candidate, ExistingTeams, ExistingTeam } from '../types';
import { UsersIcon } from './Icons';

interface MiniCandidateCardProps {
    candidate: Candidate;
    onClick: (candidate: Candidate) => void;
}

const MiniCandidateCard: React.FC<MiniCandidateCardProps> = ({ candidate, onClick }) => (
    <div
        className="inline-flex items-center space-x-2 p-2 rounded-md hover:bg-gray-100 cursor-pointer transition-colors"
        onClick={() => onClick(candidate)}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') onClick(candidate) }}
    >
        <img src={candidate.avatarUrl} alt={candidate.name} className="w-8 h-8 rounded-full" />
        <div>
            <p className="font-semibold text-sm text-gray-700">{candidate.name}</p>
            <p className="text-xs text-gray-500">{candidate.role}</p>
        </div>
    </div>
);

interface ExistingOrgChartProps {
    teams: ExistingTeams;
    candidates: Candidate[];
    onShowDetails: (candidate: Candidate) => void;
}

export const ExistingOrgChart: React.FC<ExistingOrgChartProps> = ({ teams, candidates, onShowDetails }) => {

    const inferManagerAndReports = (teamMembers: Candidate[]) => {
        if (!teamMembers || teamMembers.length === 0) {
            return { manager: null, reports: [] };
        }

        const membersCopy = [...teamMembers];
        let manager: Candidate | null = null;
        
        const managerKeywords = ['Lead', 'Principal', 'Manager'];
        
        // Find by role keyword first (case-insensitive)
        const managerIndex = membersCopy.findIndex(m => 
            managerKeywords.some(kw => m.role.toLowerCase().includes(kw.toLowerCase()))
        );

        if (managerIndex !== -1) {
            manager = membersCopy.splice(managerIndex, 1)[0];
        } else if (membersCopy.length > 0) {
            // Fallback to most experience if no title match
            membersCopy.sort((a, b) => b.experience - a.experience);
            manager = membersCopy.shift() || null;
        }

        return { manager, reports: membersCopy };
    };

    return (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <div className="flex items-center gap-3 mb-4 border-b pb-3">
                <UsersIcon />
                <h2 className="text-2xl font-semibold text-gray-800">Existing Organization</h2>
            </div>
            <div className="space-y-8">
                {Object.values(teams).map((team: ExistingTeam) => {
                    const teamMembers = candidates.filter(c => team.members.includes(c.id));
                    const { manager, reports } = inferManagerAndReports(teamMembers);

                    if (!manager) {
                        return null; // Don't render empty or invalid teams
                    }

                    return (
                        <div key={team.title}>
                            <h3 className="font-bold text-lg text-gray-700 mb-3">{team.title}</h3>
                            <div className="ml-2">
                                <div className="relative">
                                    <MiniCandidateCard candidate={manager} onClick={onShowDetails} />
                                    {/* Vertical line connecting to reports, only if there are reports */}
                                    {reports.length > 0 && (
                                        <span className="absolute left-5 top-full -mt-2 w-0.5 h-4 bg-gray-200" aria-hidden="true"></span>
                                    )}
                                </div>
                                {reports.length > 0 && (
                                    <ul className="pl-5 mt-2 relative border-l-2 border-gray-200">
                                        {reports.map((member) => (
                                            <li key={member.id} className="relative py-2 pl-8">
                                                {/* Horizontal line connecting to main vertical line */}
                                                <span className="absolute left-0 top-1/2 -mt-px w-8 h-0.5 bg-gray-200" aria-hidden="true"></span>
                                                <MiniCandidateCard candidate={member} onClick={onShowDetails} />
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};