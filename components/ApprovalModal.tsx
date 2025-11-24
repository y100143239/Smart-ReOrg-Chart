import React, { useState, useEffect } from 'react';
import type { ApprovalStepState } from '../types';
import { XIcon, UploadIcon, PaperclipIcon } from './Icons';

interface ApprovalModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: (data: { remarks: string; attachmentName?: string }) => void;
    action: ApprovalStepState | null;
    roleCount: number;
}

export const ApprovalModal: React.FC<ApprovalModalProps> = ({ isOpen, onClose, onConfirm, action, roleCount }) => {
    const [remarks, setRemarks] = useState('');
    const [attachment, setAttachment] = useState<File | null>(null);
    const [error, setError] = useState('');

    useEffect(() => {
        if (isOpen) {
            setRemarks('');
            setAttachment(null);
            setError('');
        }
    }, [isOpen]);

    if (!isOpen || !action) return null;

    const handleSubmit = () => {
        if (remarks.trim() === '') {
            setError('Remarks are required to proceed.');
            return;
        }
        setError('');
        onConfirm({ remarks, attachmentName: attachment?.name });
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setAttachment(e.target.files[0]);
        }
    };

    const titleText = `${action === 'approved' ? 'Approve' : 'Reject'} ${roleCount} Role(s)`;
    const confirmButtonColor = action === 'approved' ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700';

    return (
        <div 
            className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50 transition-opacity"
            onClick={onClose}
            role="dialog"
            aria-modal="true"
            aria-labelledby="approval-modal-title"
        >
            <div 
                className="bg-white rounded-xl shadow-2xl p-8 w-full max-w-lg m-4 transform transition-all"
                onClick={e => e.stopPropagation()}
            >
                <div className="flex justify-between items-start mb-6">
                    <h2 id="approval-modal-title" className="text-2xl font-bold text-gray-900">{titleText}</h2>
                    <button 
                        onClick={onClose} 
                        className="text-gray-400 hover:text-gray-600 transition-colors"
                        aria-label="Close"
                    >
                        <XIcon className="w-7 h-7" />
                    </button>
                </div>

                <div className="space-y-4">
                    <div>
                        <label htmlFor="remarks" className="block text-sm font-medium text-gray-700 mb-1">
                            Remarks / Justification <span className="text-red-500">*</span>
                        </label>
                        <textarea
                            id="remarks"
                            value={remarks}
                            onChange={(e) => setRemarks(e.target.value)}
                            rows={4}
                            className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                            placeholder={action === 'approved' ? 'e.g., "Candidate is an excellent fit for the team goals."' : 'e.g., "Concerned about the skill gap on the vacated team."'}
                        />
                         {error && <p className="text-sm text-red-600 mt-1">{error}</p>}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Attach Supporting Document (Optional)
                        </label>
                        <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                            <div className="space-y-1 text-center">
                               {attachment ? (
                                    <div className="text-sm text-gray-600 flex items-center">
                                       <PaperclipIcon className="w-5 h-5 mr-2" />
                                       <span className="font-semibold">{attachment.name}</span>
                                       <button onClick={() => setAttachment(null)} className="ml-3 text-red-500 hover:text-red-700 text-xs font-bold">(Remove)</button>
                                    </div>
                               ) : (
                                    <>
                                        <UploadIcon className="mx-auto h-12 w-12 text-gray-400" />
                                        <div className="flex text-sm text-gray-600">
                                            <label htmlFor="file-upload" className="relative cursor-pointer bg-white rounded-md font-medium text-indigo-600 hover:text-indigo-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-indigo-500">
                                                <span>Upload a file</span>
                                                <input id="file-upload" name="file-upload" type="file" className="sr-only" onChange={handleFileChange} />
                                            </label>
                                            <p className="pl-1">or drag and drop</p>
                                        </div>
                                        <p className="text-xs text-gray-500">PDF, DOCX, PNG up to 10MB</p>
                                    </>
                               )}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="mt-8 flex justify-end gap-3">
                    <button 
                        onClick={onClose} 
                        type="button"
                        className="bg-gray-100 text-gray-700 font-bold py-2 px-6 rounded-lg hover:bg-gray-200 transition-all"
                    >
                        Cancel
                    </button>
                    <button 
                        onClick={handleSubmit} 
                        type="button"
                        className={`text-white font-bold py-2 px-6 rounded-lg transition-all ${confirmButtonColor}`}
                    >
                        Confirm {action.charAt(0).toUpperCase() + action.slice(1)}
                    </button>
                </div>
            </div>
        </div>
    );
};