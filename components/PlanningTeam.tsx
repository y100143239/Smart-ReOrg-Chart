import React, { useState, useEffect, useRef } from 'react';
import type { TeamData, User, AppPhase, ApprovalStatus } from '../types';
import { TeamSlot } from './TeamSlot';
import { AddRoleControl } from './AddRoleControl';

interface PlanningTeamProps {
    teamId: string;
    teamData: TeamData;
    appPhase: AppPhase;
    currentUser: User;
    onUpdateTeamTitle: (teamId: string, newTitle: string) => void;
    onAddRole: (teamId: string, title: string) => void;
    onUpdateRoleTitle: (teamId: string, roleId: string, newTitle: string) => void;
    onShowDetails: (candidate: any) => void;
    onAddComment: (teamId: string, roleId: string, commentText: string) => void;
    activeCommentThread: string | null;
    setActiveCommentThread: (roleId: string | null) => void;
    approvalStatus: ApprovalStatus;
}

export const PlanningTeam: React.FC<PlanningTeamProps> = (props) => {
    const { teamId, teamData, appPhase, currentUser, onUpdateTeamTitle, onAddRole, ...rest } = props;
    const [isEditingTitle, setIsEditingTitle] = useState(false);
    const [editedTitle, setEditedTitle] = useState(teamData.title);
    const titleInputRef = useRef<HTMLInputElement>(null);

    const canPlan = currentUser.role === 'projectManager' && appPhase === 'planning';

    useEffect(() => {
        if (isEditingTitle) {
            titleInputRef.current?.focus();
            titleInputRef.current?.select();
        }
    }, [isEditingTitle]);

    const handleTitleBlur = () => {
        if (editedTitle.trim() && editedTitle.trim() !== teamData.title) {
            onUpdateTeamTitle(teamId, editedTitle.trim());
        } else {
            setEditedTitle(teamData.title);
        }
        setIsEditingTitle(false);
    };

    const handleTitleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') handleTitleBlur();
        else if (e.key === 'Escape') {
            setEditedTitle(teamData.title);
            setIsEditingTitle(false);
        }
    };

    return (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            {isEditingTitle ? (
                <input
                    ref={titleInputRef}
                    type="text"
                    value={editedTitle}
                    onChange={(e) => setEditedTitle(e.target.value)}
                    onBlur={handleTitleBlur}
                    onKeyDown={handleTitleKeyDown}
                    className="text-xl font-bold text-gray-900 mb-4 bg-white border border-indigo-400 rounded-md px-2 py-1 w-full"
                />
            ) : (
                <h3 
                    className={`text-xl font-bold text-gray-900 mb-4 ${canPlan ? 'cursor-pointer hover:bg-gray-100 rounded-md p-1' : 'p-1'}`}
                    onClick={() => canPlan && setIsEditingTitle(true)}
                >
                    {teamData.title}
                </h3>
            )}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 relative">
                {Object.entries(teamData.roles).map(([roleId, slotData]) => (
                    // FIX: Pass required props explicitly to TeamSlot. The original `...rest` spread was problematic
                    // as it omitted `appPhase` and `currentUser`, and passed `onUpdateRoleTitle`
                    // instead of the required `onUpdateTitle` prop.
                    <TeamSlot
                        key={roleId}
                        teamId={teamId}
                        roleId={roleId}
                        slotData={slotData}
                        appPhase={props.appPhase}
                        currentUser={props.currentUser}
                        onUpdateTitle={props.onUpdateRoleTitle}
                        onShowDetails={props.onShowDetails}
                        onAddComment={props.onAddComment}
                        activeCommentThread={props.activeCommentThread}
                        setActiveCommentThread={props.setActiveCommentThread}
                        status={props.approvalStatus[roleId]}
                    />
                ))}
                 {canPlan && <AddRoleControl onAddRole={(title) => onAddRole(teamId, title)} />}
            </div>
        </div>
    );
};