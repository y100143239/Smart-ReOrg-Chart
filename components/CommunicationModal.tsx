import React, { useState } from 'react';
import type { CommunicationDrafts } from '../types';
import { XIcon, ClipboardCopyIcon, CheckCircleIcon } from './Icons';

interface CommunicationModalProps {
    isOpen: boolean;
    onClose: () => void;
    drafts: CommunicationDrafts | null;
}

type Tab = 'newTeam' | 'vacatedManager' | 'companyAnnouncement';

export const CommunicationModal: React.FC<CommunicationModalProps> = ({ isOpen, onClose, drafts }) => {
    const [activeTab, setActiveTab] = useState<Tab>('newTeam');
    const [copyStatus, setCopyStatus] = useState<Record<Tab, boolean>>({ newTeam: false, vacatedManager: false, companyAnnouncement: false });

    if (!isOpen || !drafts) return null;

    const handleCopy = (text: string) => {
        navigator.clipboard.writeText(text).then(() => {
            setCopyStatus({ ...copyStatus, [activeTab]: true });
            setTimeout(() => setCopyStatus({ ...copyStatus, [activeTab]: false }), 2000);
        });
    };

    const tabs: { id: Tab; label: string }[] = [
        { id: 'newTeam', label: 'New Team Welcome' },
        { id: 'vacatedManager', label: 'Manager Notification' },
        { id: 'companyAnnouncement', label: 'Company Announcement' },
    ];
    
    const currentDraft = drafts[activeTab];

    return (
        <div 
            className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50 transition-opacity"
            onClick={onClose}
            role="dialog"
            aria-modal="true"
            aria-labelledby="comm-modal-title"
        >
            <div 
                className="bg-white rounded-xl shadow-2xl p-8 w-full max-w-3xl m-4 transform transition-all flex flex-col max-h-[90vh]"
                onClick={e => e.stopPropagation()}
            >
                <div className="flex justify-between items-start mb-4">
                    <h2 id="comm-modal-title" className="text-2xl font-bold text-gray-900">AI-Generated Communication Drafts</h2>
                    <button 
                        onClick={onClose} 
                        className="text-gray-400 hover:text-gray-600 transition-colors"
                        aria-label="Close"
                    >
                        <XIcon className="w-7 h-7" />
                    </button>
                </div>

                <div className="border-b border-gray-200 mb-4">
                    <nav className="-mb-px flex space-x-6" aria-label="Tabs">
                        {tabs.map(tab => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`${
                                    activeTab === tab.id
                                        ? 'border-indigo-500 text-indigo-600'
                                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                } whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm transition-colors`}
                            >
                                {tab.label}
                            </button>
                        ))}
                    </nav>
                </div>

                <div className="flex-grow overflow-y-auto pr-4 -mr-4">
                    <div className="mb-4">
                        <label className="text-sm font-semibold text-gray-600">Subject</label>
                        <p className="p-2 bg-gray-100 rounded-md mt-1 border border-gray-200">{currentDraft.subject}</p>
                    </div>
                    <div>
                        <label className="text-sm font-semibold text-gray-600">Body</label>
                        <div className="p-3 bg-gray-50 rounded-md mt-1 border border-gray-200 h-80 overflow-y-auto whitespace-pre-wrap text-sm text-gray-800">
                           {currentDraft.body}
                        </div>
                    </div>
                </div>

                <div className="mt-6 flex justify-between items-center">
                    <button
                        onClick={() => handleCopy(`Subject: ${currentDraft.subject}\n\n${currentDraft.body}`)}
                        className="flex items-center gap-2 bg-indigo-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-indigo-700 transition-colors"
                    >
                        {copyStatus[activeTab] ? <CheckCircleIcon className="w-5 h-5" /> : <ClipboardCopyIcon />}
                        {copyStatus[activeTab] ? 'Copied!' : 'Copy to Clipboard'}
                    </button>
                     <button 
                        onClick={onClose} 
                        type="button"
                        className="bg-gray-100 text-gray-700 font-bold py-2 px-6 rounded-lg hover:bg-gray-200 transition-all"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
};