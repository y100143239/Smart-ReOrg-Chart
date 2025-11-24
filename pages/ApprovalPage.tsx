import React, { useMemo, useState } from 'react';
// FIX: Import `TeamData` and `ApprovalChain` for explicit typing.
import type { OrgStructure, User, ApprovalStatus, Candidate, ImpactAnalysis, TeamData, ApprovalChain } from '../types';
import { TeamSlot } from '../components/TeamSlot';
import { ImpactAnalysis as ImpactAnalysisComponent } from '../components/ImpactAnalysis';
import { RocketLaunchIcon, CheckDoubleIcon, XCircleIcon } from '../components/Icons';

interface ApprovalPageProps {
    orgStructure: OrgStructure;
    currentUser: User;
    approvalStatus: ApprovalStatus;
    impactAnalysis: ImpactAnalysis | null;
    selectedRoles: Set<string>;
    onShowDetails: (candidate: Candidate) => void;
    onInitiateApproval: (roles: string[], action: 'approved' | 'rejected') => void;
    onToggleSelection: React.Dispatch<React.SetStateAction<Set<string>>>;
    onProceedToExecution: () => void;
}

export const ApprovalPage: React.FC<ApprovalPageProps> = (props) => {
    const { orgStructure, currentUser, approvalStatus, impactAnalysis, selectedRoles, onShowDetails, onInitiateApproval, onToggleSelection, onProceedToExecution } = props;

    const actionableRoles = useMemo(() => {
        // FIX: Add explicit type for `team` to resolve property access errors.
        return Object.values(orgStructure).flatMap((team: TeamData) => Object.keys(team.roles))
            .filter(roleId => {
                const status = approvalStatus[roleId];
                if (!status) return false;
                const canHrApprove = currentUser.role === 'hrPartner' && status.hr.state === 'pending';
                const canDeptHeadApprove = currentUser.role === 'deptHead' && status.hr.state === 'approved' && status.deptHead.state === 'pending';
                return canHrApprove || canDeptHeadApprove;
            });
    }, [orgStructure, approvalStatus, currentUser.role]);

    const isFullyApproved = useMemo(() => {
        const allStatuses = Object.values(approvalStatus);
        if (allStatuses.length === 0) return false;
        // FIX: Add explicit type for `s` to resolve property access errors.
        return allStatuses.every((s: ApprovalChain) => s.hr.state === 'approved' && s.deptHead.state === 'approved');
    }, [approvalStatus]);

    const handleSelectAll = () => {
        if (selectedRoles.size === actionableRoles.length) {
            onToggleSelection(new Set());
        } else {
            onToggleSelection(new Set(actionableRoles));
        }
    };

    const handleToggle = (roleId: string) => {
        const newSelection = new Set(selectedRoles);
        if (newSelection.has(roleId)) {
            newSelection.delete(roleId);
        } else {
            newSelection.add(roleId);
        }
        onToggleSelection(newSelection);
    };

    const overallStatus = useMemo(() => {
        if (Object.keys(approvalStatus).length === 0) return "Awaiting Submission";
        const allStatuses = Object.values(approvalStatus);
        // FIX: Add explicit type for `s` to resolve property access errors.
        if (allStatuses.some((s: ApprovalChain) => s.hr.state === 'rejected' || s.deptHead.state === 'rejected')) return "Plan Rejected";
        // FIX: Add explicit type for `s` to resolve property access errors.
        if (!allStatuses.every((s: ApprovalChain) => s.hr.state === 'approved')) return "Pending HR Approval";
        // FIX: Add explicit type for `s` to resolve property access errors.
        if (!allStatuses.every((s: ApprovalChain) => s.deptHead.state === 'approved')) return "Pending Dept. Head Approval";
        return "Fully Approved";
    }, [approvalStatus]);


    return (
        <div className="max-w-7xl mx-auto w-full">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                <div className="flex justify-between items-center mb-4 border-b pb-3 flex-wrap gap-4">
                    <h2 className="text-2xl font-semibold text-gray-800">Review & Approve Plan</h2>
                    <div className="flex items-center gap-4">
                        <span className={`font-bold px-3 py-1 rounded-full text-sm ${
                            overallStatus === "Fully Approved" ? 'bg-green-100 text-green-800' : 
                            overallStatus === "Plan Rejected" ? 'bg-red-100 text-red-800' :
                            'bg-yellow-100 text-yellow-800'
                        }`}>{overallStatus}</span>
                        {isFullyApproved && (
                            <button
                                onClick={onProceedToExecution}
                                className="flex items-center gap-2 bg-indigo-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-indigo-700"
                            >
                                <RocketLaunchIcon />
                                Proceed to Execution
                            </button>
                        )}
                    </div>
                </div>

                {impactAnalysis && <div className="mb-6"><ImpactAnalysisComponent analysis={impactAnalysis} /></div>}

                {selectedRoles.size > 0 && (
                    <div className="bg-indigo-50 border border-indigo-200 p-4 rounded-lg mb-6 flex items-center justify-between">
                        <p className="font-semibold text-indigo-800">{selectedRoles.size} role(s) selected.</p>
                        <div className="flex gap-3">
                            <button onClick={() => onInitiateApproval(Array.from(selectedRoles), 'approved')} className="flex items-center gap-2 text-sm bg-green-600 text-white font-semibold py-2 px-3 rounded-md hover:bg-green-700">
                                <CheckDoubleIcon/> Approve Selected
                            </button>
                            <button onClick={() => onInitiateApproval(Array.from(selectedRoles), 'rejected')} className="flex items-center gap-2 text-sm bg-red-600 text-white font-semibold py-2 px-3 rounded-md hover:bg-red-700">
                                <XCircleIcon className="w-5 h-5"/> Reject Selected
                            </button>
                        </div>
                    </div>
                )}

                {actionableRoles.length > 0 && selectedRoles.size < actionableRoles.length && (
                     <div className="flex items-center mb-4">
                        <input
                            id="select-all"
                            type="checkbox"
                            className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                            checked={selectedRoles.size === actionableRoles.length}
                            onChange={handleSelectAll}
                        />
                        <label htmlFor="select-all" className="ml-2 block text-sm font-medium text-gray-700">
                            Select all actionable roles
                        </label>
                    </div>
                )}
                
                <div className="space-y-8">
                    {/* FIX: Add explicit type for `teamData` to resolve property access errors. */}
                    {Object.entries(orgStructure).map(([teamId, teamData]: [string, TeamData]) => (
                        <div key={teamId} className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                             <h3 className="text-xl font-bold text-gray-900 mb-4 p-1">{teamData.title}</h3>
                             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {Object.entries(teamData.roles).map(([roleId, slotData]) => (
                                    <TeamSlot
                                        key={roleId}
                                        teamId={teamId}
                                        roleId={roleId}
                                        slotData={slotData}
                                        appPhase="approval"
                                        currentUser={currentUser}
                                        status={approvalStatus[roleId]}
                                        onInitiateApproval={(action) => onInitiateApproval([roleId], action)}
                                        onShowDetails={onShowDetails}
                                        isSelected={selectedRoles.has(roleId)}
                                        onToggleSelection={handleToggle}
                                        // Props not used in approval phase
                                        onUpdateTitle={() => {}}
                                        onAddComment={() => {}}
                                        activeCommentThread={null}
                                        setActiveCommentThread={() => {}}
                                    />
                                ))}
                             </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};