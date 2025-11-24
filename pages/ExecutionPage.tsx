import React from 'react';
// FIX: Import `TeamData` and `TeamSlotData` for explicit typing.
import type { OrgStructure, Candidate, TeamData, TeamSlotData } from '../types';
import { CandidateCard } from '../components/CandidateCard';
import { MailIcon, DownloadIcon, CheckCircleIcon } from '../components/Icons';

interface ExecutionPageProps {
    orgStructure: OrgStructure;
    isGeneratingComm: boolean;
    isReorgComplete: boolean;
    onGenerateCommunications: () => void;
    onExportCsv: () => void;
    onCompleteReorg: () => void;
    onShowDetails: (candidate: Candidate) => void;
}

export const ExecutionPage: React.FC<ExecutionPageProps> = (props) => {
    const { orgStructure, isGeneratingComm, isReorgComplete, onGenerateCommunications, onExportCsv, onCompleteReorg, onShowDetails } = props;

    if (isReorgComplete) {
        return (
            <div className="max-w-4xl mx-auto text-center bg-white p-10 rounded-xl shadow-xl">
                 <CheckCircleIcon className="w-20 h-20 text-green-500 mx-auto mb-4" />
                 <h2 className="text-3xl font-bold text-gray-900">Reorganization Complete!</h2>
                 <p className="text-gray-600 mt-2">The new organization structure has been finalized and logged.</p>
            </div>
        )
    }

    return (
        <div className="max-w-7xl mx-auto w-full">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                <div className="flex justify-between items-center mb-6 border-b pb-4">
                    <h2 className="text-2xl font-semibold text-gray-800">Execution Hub</h2>
                    <div className="flex gap-3">
                        <button
                            onClick={onGenerateCommunications}
                            disabled={isGeneratingComm}
                            className="flex items-center gap-2 bg-indigo-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-indigo-700 disabled:bg-gray-400"
                        >
                            <MailIcon />
                            {isGeneratingComm ? 'Generating...' : 'Generate Communication Drafts'}
                        </button>
                         <button
                            onClick={onExportCsv}
                            className="flex items-center gap-2 bg-gray-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-gray-700"
                        >
                            <DownloadIcon />
                            Export to HRIS (CSV)
                        </button>
                    </div>
                </div>

                <div className="space-y-8 mb-8">
                     {/* FIX: Add explicit type for `teamData` to resolve property access errors. */}
                     {Object.entries(orgStructure).map(([teamId, teamData]: [string, TeamData]) => (
                        <div key={teamId} className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                             <h3 className="text-xl font-bold text-gray-900 mb-4 p-1">{teamData.title}</h3>
                             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                                {/* FIX: Add explicit type for `slot` to resolve property access errors. */}
                                {Object.values(teamData.roles).map((slot: TeamSlotData, index) => (
                                    <div key={index}>
                                         <p className="font-semibold text-gray-700 mb-2 text-center h-7">{slot.title}</p>
                                         <div className="border bg-white rounded-xl p-4">
                                            {slot.candidate ? (
                                                <CandidateCard candidate={slot.candidate} isDraggable={false} onClick={onShowDetails} />
                                            ) : (
                                                <div className="text-center text-gray-400 text-sm h-[116px] flex items-center justify-center">
                                                    Empty Slot
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))}
                             </div>
                        </div>
                    ))}
                </div>

                <div className="border-t pt-6 text-right">
                     <button
                        onClick={onCompleteReorg}
                        className="bg-green-600 text-white font-bold py-3 px-8 rounded-lg hover:bg-green-700 text-lg"
                    >
                        Complete Reorganization
                    </button>
                </div>
            </div>
        </div>
    );
};