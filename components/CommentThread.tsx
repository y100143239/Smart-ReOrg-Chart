import React, { useState } from 'react';
import type { Comment, User } from '../types';
import { XIcon, SendIcon } from './Icons';

interface CommentThreadProps {
    comments: Comment[];
    currentUser: User;
    onAddComment: (commentText: string) => void;
    onClose: () => void;
    roleTitle: string;
}

export const CommentThread: React.FC<CommentThreadProps> = ({ comments, currentUser, onAddComment, onClose, roleTitle }) => {
    const [newComment, setNewComment] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (newComment.trim()) {
            onAddComment(newComment.trim());
            setNewComment('');
        }
    };
    
    return (
        <div className="absolute top-0 left-0 w-full h-full bg-white rounded-lg shadow-2xl border-2 border-indigo-500 z-10 flex flex-col p-4">
            <div className="flex justify-between items-center mb-3 border-b pb-2">
                <h3 className="font-bold text-gray-800">Comments for {roleTitle}</h3>
                <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                    <XIcon className="w-5 h-5" />
                </button>
            </div>
            <div className="flex-grow overflow-y-auto space-y-3 pr-2 -mr-2 mb-3">
                {comments.length > 0 ? (
                    comments.map(comment => (
                        <div key={comment.id} className="text-sm">
                            <p className="font-semibold text-gray-700">{comment.authorName}</p>
                            <p className="bg-gray-100 p-2 rounded-md mt-1">{comment.text}</p>
                            <p className="text-xs text-gray-400 text-right mt-1">{new Date(comment.timestamp).toLocaleString()}</p>
                        </div>
                    ))
                ) : (
                    <p className="text-sm text-gray-500 text-center pt-8">No comments yet.</p>
                )}
            </div>
            <form onSubmit={handleSubmit} className="flex items-center gap-2 border-t pt-2">
                <input
                    type="text"
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Add a comment..."
                    className="flex-grow p-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-indigo-500"
                    disabled={currentUser.role === 'projectManager'}
                />
                <button
                    type="submit"
                    className="p-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:bg-gray-400"
                    disabled={!newComment.trim() || currentUser.role === 'projectManager'}
                >
                    <SendIcon />
                </button>
            </form>
        </div>
    );
};