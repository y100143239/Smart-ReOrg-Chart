

import React, { useState, useEffect, useRef } from 'react';
import { CandidateCard } from './CandidateCard';
import type { Candidate, AppPhase, ApprovalChain, ApprovalStepState, User, ApprovalDecision, Comment, TeamSlotData } from '../types';
import { useDnd } from './DndContext';
import { CheckCircleIcon, ClockIcon, XCircleIcon, UserCircleIcon, InfoIcon, CommentIcon, WarningIcon, LightbulbIcon } from './Icons';
import { CommentThread } from './CommentThread';

interface TeamSlotProps {
    teamId: string;
    roleId: string;
    slotData: TeamSlotData;
    appPhase: AppPhase;
    status?: ApprovalChain;
    // FIX: Narrow the type of `action` to match how it's used and what the parent component expects.
    onInitiateApproval?: (action: 'approved' | 'rejected') => void;
    onUpdateTitle: (teamId: string, roleId: string, newTitle: string) => void;
    onShowDetails?: (candidate: Candidate) => void;
    onAddComment: (teamId: string, roleId: string, commentText: string) => void;
    isJustUpdated?: boolean;
    currentUser: User;
    isSelected?: boolean;
    onToggleSelection?: (roleId: string) => void;
    activeCommentThread: string | null;
    setActiveCommentThread: (roleId: string | null) => void;
}


const ApprovalStep: React.FC<{ title: string, decision: ApprovalDecision }> = ({ title, decision }) => {
    const statusConfig: Record<ApprovalStepState, { Icon: React.FC, text: string, color: string, bgColor: string }> = {
        pending: { Icon: ClockIcon, text: 'Pending', color: 'text-yellow-800', bgColor: 'bg-yellow-100' },
        approved: { Icon: CheckCircleIcon, text: 'Approved', color: 'text-green-800', bgColor: 'bg-green-100' },
        rejected: { Icon: XCircleIcon, text: 'Rejected', color: 'text-red-800', bgColor: 'bg-red-100' },
    };
    const { Icon, text, color, bgColor } = statusConfig[decision.state];

    return (
        <div className="flex items-center justify-between p-2 rounded-md" style={{backgroundColor: "transparent"}}>
             <div className="flex items-center space-x-2">
                <UserCircleIcon className="w-5 h-5 text-gray-400" />
                <span className="text-sm font-medium text-gray-600">{title}</span>
                {decision.remarks && <InfoIcon className="w-4 h-4 text-gray-500" title="This decision includes remarks"/>}
            </div>
            <div className={`flex items-center space-x-1 text-xs font-semibold ${color} ${bgColor} px-2 py-1 rounded-full`}>
                <Icon />
                <span>{text}</span>
            </div>
        </div>
    );
};


export const TeamSlot: React.FC<TeamSlotProps> = (props) => {
    const { 
        teamId, roleId, slotData, appPhase, status, 
        onInitiateApproval, onUpdateTitle, onShowDetails, onAddComment, isJustUpdated, 
        currentUser, isSelected, onToggleSelection,
        activeCommentThread, setActiveCommentThread
    } = props;
    const { title, candidate, comments, complianceIssue, aiSuggestionReason } = slotData;

    const [isDragOver, setIsDragOver] = useState(false);
    const [isEditingTitle, setIsEditingTitle] = useState(false);
    const [editedTitle, setEditedTitle] = useState(title);
    const titleInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (isEditingTitle) {
            titleInputRef.current?.focus();
            titleInputRef.current?.select();
        }
    }, [isEditingTitle]);

    const isPlanningPhase = appPhase === 'planning';
    const canProjectManagerPlan = isPlanningPhase && currentUser.role === 'projectManager';
    const isCommentThreadActive = activeCommentThread === roleId;
    const isAnyCommentThreadActive = activeCommentThread !== null;
    
    const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
        if (!canProjectManagerPlan || isAnyCommentThreadActive) return;
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
        setIsDragOver(true);
    };

    const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
        if (!canProjectManagerPlan) return;
        e.preventDefault();
        setIsDragOver(false);
    };

    const handleTitleBlur = () => {
        if (editedTitle.trim() && editedTitle.trim() !== title) {
            onUpdateTitle(teamId, roleId, editedTitle.trim());
        } else {
            setEditedTitle(title);
        }
        setIsEditingTitle(false);
    };

    const handleTitleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            handleTitleBlur();
        } else if (e.key === 'Escape') {
            setEditedTitle(title);
            setIsEditingTitle(false);
        }
    };

    const planningClasses = "border-2 border-dashed rounded-lg p-4 h-full flex flex-col justify-center items-center transition-colors duration-300 relative";
    const inactiveClasses = "border-gray-300 bg-gray-50";
    const activeClasses = "border-indigo-500 bg-indigo-100 ring-2 ring-indigo-300";
    const justUpdatedClasses = "border-green-400 bg-green-100";
    
    const approvalBaseClasses = "border bg-white rounded-xl p-4 h-full flex flex-col relative transition-all";
    const selectedClasses = "border-indigo-500 shadow-lg border-2";
    const unselectedClasses = "border-gray-200";

    const getPlanningBgClass = () => {
        if (isDragOver) return activeClasses;
        if (isJustUpdated) return justUpdatedClasses;
        return inactiveClasses;
    }
    
    const renderTitle = () => {
        if (isEditingTitle) {
            return (
                <input
                    ref={titleInputRef}
                    type="text"
                    value={editedTitle}
                    onChange={(e) => setEditedTitle(e.target.value)}
                    onBlur={handleTitleBlur}
                    onKeyDown={handleTitleKeyDown}
                    className="font-semibold text-gray-700 text-center bg-white border border-indigo-400 rounded-md px-1 w-full"
                />
            );
        }
        return (
            <p 
                className={`font-semibold text-gray-700 text-center ${canProjectManagerPlan ? 'cursor-pointer hover:bg-gray-200 rounded-md px-1' : ''}`}
                onClick={() => canProjectManagerPlan && setIsEditingTitle(true)}
            >
                {title}
            </p>
        );
    };

    if (appPhase === 'planning') {
        return (
            <div className="relative">
                <div className="flex justify-between items-center mb-2 h-7">
                    {renderTitle()}
                    <div className="flex items-center gap-2 pl-2">
                        {complianceIssue && (
                            <div title={complianceIssue.message}>
                                <WarningIcon severity={complianceIssue.severity}/>
                            </div>
                        )}
                         <button 
                            onClick={() => setActiveCommentThread(isCommentThreadActive ? null : roleId)} 
                            className="relative text-gray-500 hover:text-indigo-600"
                            disabled={isAnyCommentThreadActive && !isCommentThreadActive}
                        >
                            <CommentIcon />
                            {comments.length > 0 && (
                                <span className="absolute -top-1 -right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-xs text-white">
                                    {comments.length}
                                </span>
                            )}
                        </button>
                    </div>
                </div>
                <div
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    data-team-id={teamId}
                    data-role-id={roleId}
                    className={`${planningClasses} ${getPlanningBgClass()} ${isAnyCommentThreadActive && !isCommentThreadActive ? 'opacity-40' : ''}`}
                >
                    {candidate ? (
                        <div className="relative w-full">
                            <CandidateCard candidate={candidate} isDraggable={canProjectManagerPlan} onClick={onShowDetails} />
                            {aiSuggestionReason && (
                                <div className="absolute -top-2 -right-2 group z-10">
                                    <button className="p-1 bg-yellow-200 rounded-full hover:bg-yellow-300 transition-colors focus:outline-none focus:ring-2 focus:ring-yellow-400" aria-label="Show AI suggestion">
                                        <LightbulbIcon className="w-4 h-4 text-yellow-700"/>
                                    </button>
                                    <div 
                                        role="tooltip"
                                        className="absolute bottom-full mb-2 w-64 p-3 bg-gray-800 text-white text-sm rounded-lg shadow-lg opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 transition-opacity duration-300 pointer-events-none transform -translate-x-full left-4"
                                    >
                                        <p className="font-bold text-yellow-300 border-b border-yellow-400/50 pb-1 mb-2">AI Rationale</p>
                                        <p className="text-xs leading-relaxed">{aiSuggestionReason}</p>
                                        <div className="absolute top-full right-2 w-0 h-0 border-x-4 border-x-transparent border-t-4 border-t-gray-800"></div>
                                    </div>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="text-center text-gray-400 text-sm">
                            Drag candidate here
                        </div>
                    )}
                </div>
                 {isCommentThreadActive && (
                    <CommentThread
                        comments={comments}
                        currentUser={currentUser}
                        onAddComment={(text) => onAddComment(teamId, roleId, text)}
                        onClose={() => setActiveCommentThread(null)}
                        roleTitle={title}
                    />
                )}
            </div>
        );
    }
    
    // Approval & Execution Phase rendering
    const isApprovalPhase = appPhase === 'approval';
    const canHrApprove = isApprovalPhase && currentUser.role === 'hrPartner' && status?.hr.state === 'pending';
    const canDeptHeadApprove = isApprovalPhase && currentUser.role === 'deptHead' && status?.hr.state === 'approved' && status?.deptHead.state === 'pending';
    const isSelectable = isApprovalPhase && (canHrApprove || canDeptHeadApprove);

    const renderApprovalButtons = () => (
        <div className="flex gap-2 mt-3 w-full">
            <button onClick={() => onInitiateApproval?.('approved')} className="flex-1 text-sm bg-green-100 text-green-800 hover:bg-green-200 font-semibold py-1 px-2 rounded-md transition-colors">Approve</button>
            <button onClick={() => onInitiateApproval?.('rejected')} className="flex-1 text-sm bg-red-100 text-red-800 hover:bg-red-200 font-semibold py-1 px-2 rounded-md transition-colors">Reject</button>
        </div>
    );

    return (
        <div className="flex flex-col">
            <p className="font-semibold text-gray-700 mb-2 text-center h-7">{title}</p>
            <div className={`${approvalBaseClasses} ${isSelected && isApprovalPhase ? selectedClasses : unselectedClasses}`}>
                {isSelectable && (
                    <input
                        type="checkbox"
                        checked={!!isSelected}
                        onChange={() => onToggleSelection?.(roleId)}
                        className="absolute top-2 left-2 h-5 w-5 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 z-10 cursor-pointer"
                        aria-label={`Select ${candidate?.name} for bulk action`}
                    />
                )}
                {candidate ? (
                    <>
                        <CandidateCard candidate={candidate} isDraggable={false} onClick={onShowDetails} />
                         {status && (
                            <div className="w-full mt-4 space-y-2 border-t pt-3">
                                <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider text-center mb-2">Approval Chain</h4>
                                <ApprovalStep title="HR Partner" decision={status.hr} />
                                {canHrApprove && onInitiateApproval && renderApprovalButtons()}
                                <ApprovalStep title="Dept. Head" decision={status.deptHead} />
                                {canDeptHeadApprove && onInitiateApproval && renderApprovalButtons()}
                            </div>
                         )}
                    </>
                ) : (
                    <div className="text-center text-gray-400 text-sm flex-grow flex items-center justify-center">
                        Empty Slot
                    </div>
                )}
            </div>
        </div>
    );
};