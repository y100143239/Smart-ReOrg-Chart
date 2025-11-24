
import React, { useState, useCallback, useMemo } from 'react';
import { getSmartSuggestions, getImpactAnalysis, getCommunicationDrafts, getComplianceReport } from './services/geminiService';
import { DndContext } from './components/DndContext';
import { CandidateModal } from './components/CandidateModal';
import { UserSwitcher } from './components/UserSwitcher';
import { ApprovalModal } from './components/ApprovalModal';
import { CommunicationModal } from './components/CommunicationModal';
import { Stepper } from './components/Stepper';
import { PlanningPage } from './pages/PlanningPage';
import { ApprovalPage } from './pages/ApprovalPage';
import { ExecutionPage } from './pages/ExecutionPage';
import { INITIAL_CANDIDATES, INITIAL_TEAM_STRUCTURE, EXISTING_TEAMS, USERS, DEFAULT_USER, AI_PROGRESS_STEPS, AI_COMPLIANCE_STEPS } from './constants';
// FIX: Add TeamData and TeamSlotData to imports to be used for explicit typing.
import type { Candidate, AIResponse, QuestionnaireData, AppPhase, ApprovalStatus, ApprovalStepState, User, ImpactAnalysis, ProgressStep, CommunicationDrafts, ComplianceReport, ReorgPurpose, OrgStructure, TeamStructure, TeamData, TeamSlotData } from './types';
import { LogoIcon } from './components/Icons';

type ApprovalModalState = {
    isOpen: boolean;
    roles: string[];
    action: ApprovalStepState | null;
}

type DropTarget = { teamId: string; roleId: string };

const App: React.FC = () => {
    const [candidates, setCandidates] = useState<Candidate[]>(INITIAL_CANDIDATES);
    const [orgStructure, setOrgStructure] = useState<OrgStructure>({ 'initial-team': { title: 'New Team', roles: INITIAL_TEAM_STRUCTURE } });
    const [aiResponse, setAiResponse] = useState<AIResponse | null>(null);
    const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);
    const [aiProgress, setAiProgress] = useState<ProgressStep[]>([]);
    const [isAiProcessComplete, setIsAiProcessComplete] = useState(false);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [appPhase, setAppPhase] = useState<AppPhase>('planning');
    const [approvalStatus, setApprovalStatus] = useState<ApprovalStatus>({});
    const [activityLog, setActivityLog] = useState<string[]>(['Welcome! Start by setting your reorganization goals.']);
    const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(null);
    const [justUpdatedRoles, setJustUpdatedRoles] = useState<Set<string>>(new Set());
    const [currentUser, setCurrentUser] = useState<User>(DEFAULT_USER);
    // FIX: Add a handler to find the user object by ID before setting state.
    const handleUserChange = (userId: string) => {
        const user = USERS.find(u => u.id === userId);
        if (user) {
            setCurrentUser(user);
        }
    };
    const [impactAnalysis, setImpactAnalysis] = useState<ImpactAnalysis | null>(null);
    const [selectedRoles, setSelectedRoles] = useState<Set<string>>(new Set());
    const [approvalModalState, setApprovalModalState] = useState<ApprovalModalState>({ isOpen: false, roles: [], action: null });
    const [questionnaireData, setQuestionnaireData] = useState<QuestionnaireData | null>(null);
    const [isCommModalOpen, setIsCommModalOpen] = useState(false);
    const [commDrafts, setCommDrafts] = useState<CommunicationDrafts | null>(null);
    const [isGeneratingComm, setIsGeneratingComm] = useState(false);
    const [isReorgComplete, setIsReorgComplete] = useState(false);
    const [complianceReport, setComplianceReport] = useState<ComplianceReport | null>(null);
    const [isCheckingCompliance, setIsCheckingCompliance] = useState(false);
    const [complianceProgress, setComplianceProgress] = useState<ProgressStep[]>([]);
    const [isComplianceCheckComplete, setIsComplianceCheckComplete] = useState(false);
    const [activeCommentThread, setActiveCommentThread] = useState<string | null>(null);

    // FIX: Add explicit type `TeamData` for the `team` parameter to resolve unknown property access.
    const allRolesInOrg = useMemo(() => Object.values(orgStructure).flatMap((team: TeamData) => Object.values(team.roles)), [orgStructure]);
    const allSlotsFilled = allRolesInOrg.length > 0 && allRolesInOrg.every(slot => slot.candidate !== null);

    const unassignedCandidates = useMemo(() => candidates.filter(c =>
        !allRolesInOrg.some(slot => slot.candidate?.id === c.id)
    ), [candidates, allRolesInOrg]);

    const handleQuestionnaireChange = useCallback((data: QuestionnaireData) => {
        setQuestionnaireData(data);
        if (appPhase !== 'planning') return;

        let newOrgStructure: OrgStructure = {};
        if (data.reorgPurpose === 'organize_new') {
            newOrgStructure = { 'initial-team': { title: 'New Team', roles: INITIAL_TEAM_STRUCTURE } };
        } else if (data.targetTeamId && (data.reorgPurpose === 'expand_existing' || data.reorgPurpose === 'restructure_existing')) {
            const targetTeamData = EXISTING_TEAMS[data.targetTeamId];
            if (targetTeamData) {
                const newTeamStructure: TeamStructure = {};
                targetTeamData.members.forEach((memberId, index) => {
                    const candidate = INITIAL_CANDIDATES.find(c => c.id === memberId);
                    if (candidate) {
                        const roleId = `${data.targetTeamId}-member-${index}`;
                        newTeamStructure[roleId] = { title: candidate.role, candidate, comments: [] };
                    }
                });
                newOrgStructure = { [data.targetTeamId]: { title: targetTeamData.title, roles: newTeamStructure } };
            }
        } else if (data.reorgPurpose === 'restructure_multiple') {
            newOrgStructure = {}; // Start with a blank canvas
        }
        setOrgStructure(newOrgStructure);
        setAiResponse(null);
        setIsAiProcessComplete(false);
        setComplianceReport(null);
        setIsComplianceCheckComplete(false);
    }, [appPhase]);

    const handleGetSuggestions = async (data: QuestionnaireData) => {
        setIsLoadingSuggestions(true);
        setError(null);
        setAiResponse(null);
        setActivityLog(prev => [`${currentUser.name} is generating AI suggestions...`, ...prev]);
        setAiProgress(AI_PROGRESS_STEPS.map(step => ({ ...step, status: 'pending' })));
        setIsAiProcessComplete(false);
        setComplianceReport(null);

        const runWithDelay = (fn: () => void, delay: number) => new Promise(res => setTimeout(() => { fn(); res(null); }, delay));
        const updateStep = (id: string, status: ProgressStep['status']) => setAiProgress(prevSteps => prevSteps.map(step => step.id.startsWith(id) ? { ...step, status } : step));

        try {
            await runWithDelay(() => updateStep('parse', 'in-progress'), 100);
            await runWithDelay(() => updateStep('parse', 'complete'), 500);
            await runWithDelay(() => updateStep('query', 'in-progress'), 0);
            await runWithDelay(() => updateStep('query', 'complete'), 1000);
            await runWithDelay(() => updateStep('hr', 'in-progress'), 0);
            await runWithDelay(() => updateStep('hr', 'complete'), 500);
            await runWithDelay(() => updateStep('analyze', 'in-progress'), 0);
            await runWithDelay(() => updateStep('analyze', 'complete'), 1000);
            await runWithDelay(() => updateStep('shortlist', 'in-progress'), 0);
            await runWithDelay(() => updateStep('sub-skill', 'in-progress'), 200);
            await runWithDelay(() => updateStep('sub-skill', 'complete'), 500);
            await runWithDelay(() => updateStep('sub-exp', 'in-progress'), 0);
            await runWithDelay(() => updateStep('sub-exp', 'complete'), 500);
            await runWithDelay(() => updateStep('sub-syn', 'in-progress'), 0);
            await runWithDelay(() => updateStep('sub-syn', 'complete'), 500);
            
            const response = await getSmartSuggestions(data, unassignedCandidates, orgStructure, EXISTING_TEAMS);
            setAiResponse(response);
            
            await runWithDelay(() => updateStep('shortlist', 'complete'), 100);
            await runWithDelay(() => updateStep('finalize', 'in-progress'), 0);
            
            const populatedRoleKeys = new Set<string>();
            const newOrgStructure: OrgStructure = data.reorgPurpose === 'expand_existing' && data.targetTeamId ? { ...orgStructure } : {};
            
            response.suggestions.forEach((teamSuggestion, teamIndex) => {
                const isExpanding = data.reorgPurpose === 'expand_existing' && data.targetTeamId;
                const teamId = isExpanding ? data.targetTeamId : `ai-team-${Date.now()}-${teamIndex}`;
                
                if (!newOrgStructure[teamId]) {
                    newOrgStructure[teamId] = { title: teamSuggestion.teamTitle, roles: {} };
                }

                teamSuggestion.roles.forEach(roleSuggestion => {
                    const candidate = candidates.find(c => c.id === roleSuggestion.candidateId);
                    if (candidate) {
                        const roleId = `ai-role-${teamId}-${roleSuggestion.role.replace(/\s+/g, '-')}-${Math.random()}`;
                        newOrgStructure[teamId].roles[roleId] = {
                            title: roleSuggestion.role,
                            candidate,
                            comments: [],
                            aiSuggestionReason: roleSuggestion.reason
                        };
                        populatedRoleKeys.add(roleId);
                    }
                });
            });

            setOrgStructure(newOrgStructure);
            setJustUpdatedRoles(populatedRoleKeys);
            
            await runWithDelay(() => updateStep('finalize', 'complete'), 500);
            setTimeout(() => setJustUpdatedRoles(new Set()), 2500);

            setActivityLog(prev => ['AI suggestions received and org structure updated.', ...prev]);
        } catch (err) {
            const errorMessage = err instanceof Error ? `Error fetching suggestions: ${err.message}` : 'An unknown error occurred.';
            setError(errorMessage);
            setActivityLog(prev => [`Failed to get AI suggestions.`, ...prev]);
        } finally {
            setIsLoadingSuggestions(false);
            setIsAiProcessComplete(true);
        }
    };
    
    const handleRunComplianceCheck = async () => {
        setIsCheckingCompliance(true);
        setIsComplianceCheckComplete(false);
        setError(null);
        setComplianceReport(null);
        setActivityLog(prev => [`${currentUser.name} initiated an AI compliance check.`, ...prev]);
        setComplianceProgress(AI_COMPLIANCE_STEPS.map(step => ({ ...step, status: 'pending' })));

        setOrgStructure(prevOrg => {
            const newOrg = { ...prevOrg };
            for(const teamId in newOrg) {
                for(const roleId in newOrg[teamId].roles) {
                    delete newOrg[teamId].roles[roleId].complianceIssue;
                }
            }
            return newOrg;
        });

        const runWithDelay = (fn: () => void, delay: number) => new Promise(res => setTimeout(() => { fn(); res(null); }, delay));
        const updateStep = (id: string, status: ProgressStep['status']) => setComplianceProgress(prevSteps => prevSteps.map(step => step.id === id ? { ...step, status } : step));

        try {
            await runWithDelay(() => updateStep('init', 'in-progress'), 100);
            await runWithDelay(() => updateStep('init', 'complete'), 400);
            
            await runWithDelay(() => updateStep('check-roles', 'in-progress'), 0);
            await runWithDelay(() => updateStep('check-roles', 'complete'), 600);
            
            await runWithDelay(() => updateStep('check-seniority', 'in-progress'), 0);
            await runWithDelay(() => updateStep('check-seniority', 'complete'), 600);
            
            await runWithDelay(() => updateStep('check-depletion', 'in-progress'), 0);
            await runWithDelay(() => updateStep('check-depletion', 'complete'), 600);
            
            await runWithDelay(() => updateStep('check-complete', 'in-progress'), 0);
            await runWithDelay(() => updateStep('check-complete', 'complete'), 500);

            await runWithDelay(() => updateStep('gen-report', 'in-progress'), 0);

            const report = await getComplianceReport(orgStructure);
            setComplianceReport(report);

            setOrgStructure(prevOrg => {
                const newOrg = JSON.parse(JSON.stringify(prevOrg));
                report.issues.forEach(issue => {
                    if (issue.teamId && issue.roleId && newOrg[issue.teamId] && newOrg[issue.teamId].roles[issue.roleId]) {
                        newOrg[issue.teamId].roles[issue.roleId].complianceIssue = issue;
                    }
                });
                return newOrg;
            });

            await runWithDelay(() => updateStep('gen-report', 'complete'), 500);

            setActivityLog(prev => ['AI compliance check complete.', ...prev]);
        } catch(err) {
            const errorMessage = err instanceof Error ? `Error during compliance check: ${err.message}` : 'An unknown error occurred.';
            setError(errorMessage);
            setActivityLog(prev => [`Failed to run compliance check.`, ...prev]);
        } finally {
            setIsCheckingCompliance(false);
            setIsComplianceCheckComplete(true);
        }
    };

    const handleDrop = useCallback((candidateId: string, target: DropTarget | null) => {
        const candidateToMove = candidates.find(c => c.id === candidateId);
        if (!candidateToMove) return;

        setOrgStructure(currentOrg => {
            const newOrg = JSON.parse(JSON.stringify(currentOrg));
            let sourceTeamId: string | null = null;
            let sourceRoleId: string | null = null;

            for (const teamId in newOrg) {
                for (const roleId in newOrg[teamId].roles) {
                    if (newOrg[teamId].roles[roleId].candidate?.id === candidateId) {
                        sourceTeamId = teamId;
                        sourceRoleId = roleId;
                        break;
                    }
                }
                if (sourceRoleId) break;
            }

            if (sourceRoleId && sourceTeamId) {
                newOrg[sourceTeamId].roles[sourceRoleId].candidate = null;
                delete newOrg[sourceTeamId].roles[sourceRoleId].aiSuggestionReason;
            }

            if (target) {
                const { teamId: targetTeamId, roleId: targetRoleId } = target;
                if (newOrg[targetTeamId] && newOrg[targetTeamId].roles[targetRoleId]) {
                    const existingCandidate = newOrg[targetTeamId].roles[targetRoleId].candidate;
                    if (existingCandidate && sourceTeamId && sourceRoleId) {
                        newOrg[sourceTeamId].roles[sourceRoleId].candidate = existingCandidate;
                    }
                    newOrg[targetTeamId].roles[targetRoleId].candidate = candidateToMove;
                    delete newOrg[targetTeamId].roles[targetRoleId].aiSuggestionReason;
                }
            }
            
            setComplianceReport(null);
            setIsComplianceCheckComplete(false);
            for(const teamId in newOrg) {
                 for(const roleId in newOrg[teamId].roles) {
                     delete newOrg[teamId].roles[roleId].complianceIssue;
                 }
            }
            return newOrg;
        });
    }, [candidates]);

    const handleFinalizePlan = async () => {
        if (!allSlotsFilled) {
            alert("Please fill all team slots before finalizing the plan.");
            return;
        }
        setIsAnalyzing(true);
        setActivityLog(prev => [`Plan finalized by ${currentUser.name}. Moving to Approval phase.`, ...prev]);
        try {
            const analysis = await getImpactAnalysis(orgStructure, candidates);
            setImpactAnalysis(analysis);

            // FIX: Add explicit type `TeamData` for the `t` parameter to resolve unknown property access.
            const allRoles = Object.values(orgStructure).flatMap((t: TeamData) => Object.keys(t.roles));
            const initialStatus: ApprovalStatus = {};
            allRoles.forEach(roleId => {
                initialStatus[roleId] = { 
                    hr: { state: 'pending' }, 
                    deptHead: { state: 'pending' } 
                };
            });
            setApprovalStatus(initialStatus);
            setAppPhase('approval');
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to get impact analysis.');
        } finally {
            setIsAnalyzing(false);
        }
    };
    
    const handleAddTeam = (title: string) => {
        const newTeamId = `custom-team-${Date.now()}`;
        setOrgStructure(prev => ({ ...prev, [newTeamId]: { title, roles: {} } }));
        setActivityLog(prev => [`Added new team: ${title}`, ...prev]);
    };
    
    const handleAddRole = (teamId: string, title: string) => {
        const newRoleId = `custom-role-${Date.now()}`;
        setOrgStructure(prevOrg => {
            const newOrg = { ...prevOrg };
            if (newOrg[teamId]) {
                newOrg[teamId].roles[newRoleId] = { title, candidate: null, comments: [] };
            }
            return newOrg;
        });
    };

    const handleUpdateRoleTitle = (teamId: string, roleId: string, newTitle: string) => {
        setOrgStructure(prevOrg => {
            const newOrg = JSON.parse(JSON.stringify(prevOrg));
            if (newOrg[teamId] && newOrg[teamId].roles[roleId]) {
                newOrg[teamId].roles[roleId].title = newTitle;
            }
            return newOrg;
        });
    };
    
    const handleUpdateTeamTitle = (teamId: string, newTitle: string) => {
         setOrgStructure(prevOrg => {
            const newOrg = { ...prevOrg };
            if (newOrg[teamId]) { newOrg[teamId].title = newTitle; }
            return newOrg;
        });
    };

    const handleAddComment = (teamId: string, roleId: string, commentText: string) => {
        setOrgStructure(prevOrg => {
            const newOrg = JSON.parse(JSON.stringify(prevOrg));
            if (newOrg[teamId] && newOrg[teamId].roles[roleId]) {
                newOrg[teamId].roles[roleId].comments.push({
                    id: `comment-${Date.now()}`,
                    authorId: currentUser.id,
                    authorName: currentUser.name,
                    text: commentText,
                    timestamp: new Date().toISOString()
                });
            }
            return newOrg;
        });
        const roleTitle = orgStructure[teamId].roles[roleId].title;
        setActivityLog(prev => [`${currentUser.name} commented on "${roleTitle}".`, ...prev]);
    };

    const handleInitiateApproval = (roles: string[], action: ApprovalStepState) => setApprovalModalState({ isOpen: true, roles, action });

    const handleConfirmApproval = ({ remarks, attachmentName }: { remarks: string; attachmentName?: string }) => {
        const { roles, action } = approvalModalState;
        if (!action) return;

        setApprovalStatus(prev => {
            const newStatus = { ...prev };
            roles.forEach(roleId => {
                if (newStatus[roleId]) {
                    const decision = { state: action, remarks, attachmentName };
                    if (currentUser.role === 'hrPartner') newStatus[roleId].hr = decision;
                    else if (currentUser.role === 'deptHead') newStatus[roleId].deptHead = decision;
                }
            });
            return newStatus;
        });
        setActivityLog(prev => [`${currentUser.name} ${action} ${roles.length} role(s).`, ...prev]);
        setApprovalModalState({ isOpen: false, roles: [], action: null });
        setSelectedRoles(new Set());
    };

    const handleProceedToExecution = () => {
        setAppPhase('execution');
        setActivityLog(prev => ['Plan fully approved. Proceeding to Execution phase.', ...prev]);
    };

    const handleGenerateCommunications = async () => {
        if (!questionnaireData) return;
        setIsGeneratingComm(true);
        try {
            const drafts = await getCommunicationDrafts(orgStructure, questionnaireData.teamPurpose);
            setCommDrafts(drafts);
            setIsCommModalOpen(true);
            setActivityLog(prev => [`${currentUser.name} generated communication drafts.`, ...prev]);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to generate communications.');
        } finally {
            setIsGeneratingComm(false);
        }
    };
    
    const handleExportCsv = () => {
        let csvContent = "data:text/csv;charset=utf-8,Team,Role,Candidate Name,Candidate Role\n";
        // FIX: Add explicit type `TeamData` for the `team` parameter to resolve unknown property errors.
        Object.values(orgStructure).forEach((team: TeamData) => {
            // FIX: Add explicit type `TeamSlotData` for the `role` parameter to resolve unknown property errors.
            Object.values(team.roles).forEach((role: TeamSlotData) => {
                const row = [
                    `"${team.title}"`,
                    `"${role.title}"`,
                    `"${role.candidate?.name || 'N/A'}"`,
                    `"${role.candidate?.role || 'N/A'}"`
                ].join(',');
                csvContent += row + "\n";
            });
        });
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", "reorg_plan.csv");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        setActivityLog(prev => ['Exported reorg plan to CSV.', ...prev]);
    };

    const handleCompleteReorg = () => {
        setIsReorgComplete(true);
        setActivityLog(prev => [`Reorganization process completed by ${currentUser.name}.`, ...prev]);
    };

    const renderPage = () => {
        switch (appPhase) {
            case 'planning':
                return <PlanningPage
                    // State
                    orgStructure={orgStructure}
                    unassignedCandidates={unassignedCandidates}
                    candidates={candidates}
                    isLoadingSuggestions={isLoadingSuggestions}
                    isAiProcessComplete={isAiProcessComplete}
                    aiProgress={aiProgress}
                    activityLog={activityLog}
                    currentUser={currentUser}
                    questionnaireData={questionnaireData}
                    activeCommentThread={activeCommentThread}
                    complianceReport={complianceReport}
                    isCheckingCompliance={isCheckingCompliance}
                    complianceProgress={complianceProgress}
                    isComplianceCheckComplete={isComplianceCheckComplete}
                    allSlotsFilled={allSlotsFilled}
                    isAnalyzing={isAnalyzing}
                    // Callbacks
                    onGetSuggestions={handleGetSuggestions}
                    onQuestionnaireChange={handleQuestionnaireChange}
                    onShowDetails={setSelectedCandidate}
                    onFinalizePlan={handleFinalizePlan}
                    onAddTeam={handleAddTeam}
                    onUpdateTeamTitle={handleUpdateTeamTitle}
                    onAddRole={handleAddRole}
                    onUpdateRoleTitle={handleUpdateRoleTitle}
                    onAddComment={handleAddComment}
                    setActiveCommentThread={setActiveCommentThread}
                    onRunComplianceCheck={handleRunComplianceCheck}
                />;
            case 'approval':
                return <ApprovalPage
                    orgStructure={orgStructure}
                    currentUser={currentUser}
                    approvalStatus={approvalStatus}
                    impactAnalysis={impactAnalysis}
                    selectedRoles={selectedRoles}
                    onShowDetails={setSelectedCandidate}
                    onInitiateApproval={handleInitiateApproval}
                    onToggleSelection={setSelectedRoles}
                    onProceedToExecution={handleProceedToExecution}
                />;
            case 'execution':
                return <ExecutionPage 
                    orgStructure={orgStructure}
                    isGeneratingComm={isGeneratingComm}
                    isReorgComplete={isReorgComplete}
                    onGenerateCommunications={handleGenerateCommunications}
                    onExportCsv={handleExportCsv}
                    onCompleteReorg={handleCompleteReorg}
                    onShowDetails={setSelectedCandidate}
                />;
            default:
                return null;
        }
    };

    return (
        <DndContext onDrop={handleDrop}>
            <div className="min-h-screen bg-gray-50 font-sans text-gray-800 flex flex-col">
                <header className="bg-white p-4 flex items-center justify-between sticky top-0 z-30 border-b border-gray-200">
                    <div className="flex items-center space-x-3">
                       <LogoIcon />
                       <h1 className="text-2xl font-bold text-gray-900">Smart ReOrg Chart</h1>
                    </div>
                    <UserSwitcher users={USERS} currentUser={currentUser} onUserChange={handleUserChange} />
                </header>

                <Stepper currentPhase={appPhase} />

                <main className="flex-grow p-6">
                    {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">{error}</div>}
                    {renderPage()}
                </main>

                {selectedCandidate && <CandidateModal candidate={selectedCandidate} onClose={() => setSelectedCandidate(null)} />}
                <ApprovalModal 
                    isOpen={approvalModalState.isOpen}
                    onClose={() => setApprovalModalState({ isOpen: false, roles: [], action: null })}
                    onConfirm={handleConfirmApproval}
                    action={approvalModalState.action}
                    roleCount={approvalModalState.roles.length}
                />
                <CommunicationModal 
                    isOpen={isCommModalOpen}
                    onClose={() => setIsCommModalOpen(false)}
                    drafts={commDrafts}
                />
            </div>
        </DndContext>
    );
};

export default App;