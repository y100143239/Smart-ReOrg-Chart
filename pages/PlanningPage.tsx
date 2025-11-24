import React, { useState, useMemo, useEffect } from 'react';
import { Questionnaire } from '../components/Questionnaire';
import { ProcessTracker } from '../components/AIProgressTracker';
import { ExistingOrgChart } from '../components/ExistingOrgChart';
import { PlanningTeam } from '../components/PlanningTeam';
import { AddTeamControl } from '../components/AddTeamControl';
import { ComplianceReport as ComplianceReportComponent } from '../components/ComplianceReport';
import { CandidateCard } from '../components/CandidateCard';
import { TimeZoneHelper } from '../components/TimeZoneHelper';
// FIX: Import `TeamData` and `TeamSlotData` for explicit typing.
import type { Candidate, QuestionnaireData, User, ProgressStep, ComplianceReport, OrgStructure, TeamData, TeamSlotData } from '../types';
import { SendIcon, ShieldCheckIcon } from '../components/Icons';
// FIX: Import EXISTING_TEAMS to resolve reference errors.
import { EXISTING_TEAMS } from '../constants';
import { CandidateFilter, CandidateFilters } from '../components/CandidateFilter';

interface PlanningPageProps {
    orgStructure: OrgStructure;
    unassignedCandidates: Candidate[];
    candidates: Candidate[];
    isLoadingSuggestions: boolean;
    isAiProcessComplete: boolean;
    aiProgress: ProgressStep[];
    activityLog: string[];
    currentUser: User;
    questionnaireData: QuestionnaireData | null;
    activeCommentThread: string | null;
    complianceReport: ComplianceReport | null;
    isCheckingCompliance: boolean;
    complianceProgress: ProgressStep[];
    isComplianceCheckComplete: boolean;
    allSlotsFilled: boolean;
    isAnalyzing: boolean;
    onGetSuggestions: (data: QuestionnaireData) => void;
    onQuestionnaireChange: (data: QuestionnaireData) => void;
    onShowDetails: (candidate: Candidate) => void;
    onFinalizePlan: () => void;
    onAddTeam: (title: string) => void;
    onUpdateTeamTitle: (teamId: string, newTitle: string) => void;
    onAddRole: (teamId: string, title: string) => void;
    onUpdateRoleTitle: (teamId: string, roleId: string, newTitle: string) => void;
    onAddComment: (teamId: string, roleId: string, commentText: string) => void;
    setActiveCommentThread: (roleId: string | null) => void;
    onRunComplianceCheck: () => void;
}

export const PlanningPage: React.FC<PlanningPageProps> = (props) => {
    const {
        orgStructure, unassignedCandidates, candidates, isLoadingSuggestions, isAiProcessComplete,
        aiProgress, activityLog, currentUser, questionnaireData, activeCommentThread, complianceReport,
        isCheckingCompliance, complianceProgress, isComplianceCheckComplete, allSlotsFilled, isAnalyzing,
        onGetSuggestions, onQuestionnaireChange, onShowDetails, onFinalizePlan, onAddTeam, onUpdateTeamTitle,
        onAddRole, onUpdateRoleTitle, onAddComment, setActiveCommentThread, onRunComplianceCheck
    } = props;

    const [filters, setFilters] = useState<CandidateFilters>({
        skill: '',
        minExperience: 0,
        maxExperience: 50,
        team: '',
    });
    
    const canPlan = currentUser.role === 'projectManager';
    // FIX: Add explicit types for `team` and `role` to resolve property access errors.
    const hasCandidatesInOrg = Object.values(orgStructure).some((team: TeamData) => Object.values(team.roles).some((role: TeamSlotData) => role.candidate));

    const { allTeams, maxExperience } = useMemo(() => {
        const teams = new Set<string>();
        let maxExp = 0;
        candidates.forEach(c => {
            teams.add(c.currentTeam);
            if (c.experience > maxExp) {
                maxExp = c.experience;
            }
        });
        return {
            allTeams: Array.from(teams).sort(),
            maxExperience: Math.ceil(maxExp / 5) * 5 || 20,
        };
    }, [candidates]);

    useEffect(() => {
        setFilters(f => ({ ...f, maxExperience }));
    }, [maxExperience]);
    
    const filteredUnassignedCandidates = useMemo(() => {
        return unassignedCandidates.filter(candidate => {
            const { skill, minExperience, maxExperience: filterMaxExp, team } = filters;

            const skillMatch = skill
                ? candidate.skills.some(s => s.name.toLowerCase().includes(skill.toLowerCase()))
                : true;
            
            const minExp = isNaN(minExperience) || minExperience < 0 ? 0 : minExperience;
            const maxExp = isNaN(filterMaxExp) || filterMaxExp <= 0 ? maxExperience : filterMaxExp;
            
            const expMatch = candidate.experience >= minExp && candidate.experience <= maxExp;
            
            const teamMatch = team ? candidate.currentTeam === team : true;
            
            return skillMatch && expMatch && teamMatch;
        });
    }, [unassignedCandidates, filters, maxExperience]);

    const handleFilterChange = (newFilters: Partial<CandidateFilters>) => {
        setFilters(prev => ({ ...prev, ...newFilters }));
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {/* Left Column */}
            <aside className="lg:col-span-1 xl:col-span-1 flex flex-col gap-6">
                <Questionnaire onSubmit={onGetSuggestions} onChange={onQuestionnaireChange} isLoading={isLoadingSuggestions} disabled={!canPlan} existingTeams={EXISTING_TEAMS} />
                {(isLoadingSuggestions || isAiProcessComplete) && <ProcessTracker title="AI Suggestion Process" steps={aiProgress} isComplete={isAiProcessComplete} />}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                    <h3 className="text-xl font-semibold text-gray-800 mb-4 border-b pb-2">Activity Log</h3>
                    <ul className="space-y-2 h-48 overflow-y-auto text-sm text-gray-600 pr-2">
                        {activityLog.map((log, index) => (
                            <li key={index}>&raquo; {log}</li>
                        ))}
                    </ul>
                </div>
            </aside>

            {/* Center Column */}
            <div className="lg:col-span-2 xl:col-span-2 flex flex-col gap-6">
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                    <div className="flex justify-between items-center mb-4 border-b pb-3 flex-wrap gap-4">
                        <h2 className="text-2xl font-semibold text-gray-800">New Organization Structure</h2>
                        <div className="flex items-center gap-3">
                            {canPlan && (
                                <>
                                    <button
                                        onClick={onRunComplianceCheck}
                                        disabled={isCheckingCompliance || Object.keys(orgStructure).length === 0}
                                        className="flex items-center gap-2 bg-indigo-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-indigo-700 disabled:bg-gray-400"
                                    >
                                        <ShieldCheckIcon />
                                        {isCheckingCompliance ? 'Checking...' : 'Run AI Compliance Check'}
                                    </button>
                                    <button
                                        onClick={onFinalizePlan}
                                        disabled={!allSlotsFilled || isAnalyzing}
                                        className="flex items-center gap-2 bg-green-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-green-700 disabled:bg-gray-400"
                                    >
                                        <SendIcon />
                                        {isAnalyzing ? 'Analyzing...' : 'Finalize Plan'}
                                    </button>
                                </>
                            )}
                        </div>
                    </div>
                    
                    {hasCandidatesInOrg && <div className="mb-6"><TimeZoneHelper orgStructure={orgStructure} currentUser={currentUser} /></div>}
                    {(isCheckingCompliance || isComplianceCheckComplete) && <div className="mb-6"><ProcessTracker title="AI Compliance Check" steps={complianceProgress} isComplete={isComplianceCheckComplete} /></div>}
                    {complianceReport && <div className="mb-6"><ComplianceReportComponent report={complianceReport} /></div>}

                    <div className="space-y-8">
                        {Object.keys(orgStructure).length > 0 ? (
                            Object.entries(orgStructure).map(([teamId, teamData]) => (
                                <PlanningTeam
                                    key={teamId}
                                    teamId={teamId}
                                    teamData={teamData}
                                    appPhase="planning"
                                    currentUser={currentUser}
                                    onUpdateTeamTitle={onUpdateTeamTitle}
                                    onAddRole={onAddRole}
                                    onUpdateRoleTitle={onUpdateRoleTitle}
                                    onShowDetails={onShowDetails}
                                    onAddComment={onAddComment}
                                    activeCommentThread={activeCommentThread}
                                    setActiveCommentThread={setActiveCommentThread}
                                    approvalStatus={{}} // Not needed in planning
                                />
                            ))
                        ) : (
                             <p className="text-center text-gray-500 py-10">The planning canvas is empty. Start by getting AI suggestions or adding a new team.</p>
                        )}

                        {canPlan && questionnaireData?.reorgPurpose === 'restructure_multiple' && (
                            <AddTeamControl onAddTeam={onAddTeam} />
                        )}
                    </div>
                </div>

                {canPlan && (
                    <div className={`bg-white p-6 rounded-xl shadow-sm border border-gray-200 transition-opacity ${activeCommentThread ? 'opacity-40' : ''}`}>
                        <h2 className="text-2xl font-semibold mb-4 text-gray-800 border-b pb-3">Unassigned Candidates ({filteredUnassignedCandidates.length})</h2>
                        <CandidateFilter
                            filters={filters}
                            onFilterChange={handleFilterChange}
                            allTeams={allTeams}
                            maxExperience={maxExperience}
                        />
                        <div id="candidate-pool" className="min-h-[200px] max-h-[400px] overflow-y-auto bg-gray-100 rounded-lg p-4 mt-4 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                            {filteredUnassignedCandidates.length > 0
                                ? filteredUnassignedCandidates.map(c => <CandidateCard key={c.id} candidate={c} onClick={onShowDetails} />)
                                : <p className="col-span-full text-center text-gray-500 py-8">No candidates match the current filters.</p>
                            }
                        </div>
                    </div>
                )}
            </div>

            {/* Right Column */}
            <aside className="lg:col-span-3 xl:col-span-1 flex flex-col gap-6">
                <ExistingOrgChart teams={EXISTING_TEAMS} candidates={candidates} onShowDetails={onShowDetails} />
            </aside>
        </div>
    );
};