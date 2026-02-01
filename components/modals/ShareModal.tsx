"use client";

import React, { useState } from 'react';
import { Check, Copy } from 'lucide-react';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import { Trip, SharePermission } from '../../types';

const ShareModal = ({ isOpen, onClose, trip, onGenerate, isLoading }: { isOpen: boolean, onClose: () => void, trip: Trip, onGenerate: (p: SharePermission) => void, isLoading: boolean }) => {
    const [permission, setPermission] = useState<SharePermission>('view');
    const [copied, setCopied] = useState(false);

    const shareUrl = trip.shareToken ? `${window.location.origin}/share/${trip.shareToken}` : '';

    const handleCopy = () => {
        navigator.clipboard.writeText(shareUrl);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    if (!isOpen) return null;

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Share Trip">
            <div className="space-y-8">
                <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4">Set Permissions</label>
                    <div className="grid grid-cols-2 gap-4">
                        <button
                            onClick={() => setPermission('view')}
                            className={`p-4 rounded-2xl border-2 transition-all flex flex-col items-center gap-2 ${permission === 'view' ? 'border-brand-blue bg-brand-blue/5 text-brand-blue' : 'border-gray-100 dark:border-gray-700 text-gray-500 hover:border-gray-200'}`}
                        >
                            <span className="font-bold text-lg">View Only</span>
                            <span className="text-xs opacity-70">Cannot add or edit</span>
                        </button>
                        <button
                            onClick={() => setPermission('edit')}
                            className={`p-4 rounded-2xl border-2 transition-all flex flex-col items-center gap-2 ${permission === 'edit' ? 'border-brand-blue bg-brand-blue/5 text-brand-blue' : 'border-gray-100 dark:border-gray-700 text-gray-500 hover:border-gray-200'}`}
                        >
                            <span className="font-bold text-lg">Can Edit</span>
                            <span className="text-xs opacity-70">Full contributor access</span>
                        </button>
                    </div>
                </div>

                {trip.shareToken ? (
                    <div className="space-y-4">
                        <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-700 break-all text-sm font-medium text-gray-600 dark:text-gray-400">
                            {shareUrl}
                        </div>
                        <div className="flex gap-4">
                            <Button onClick={handleCopy} variant="secondary" className="flex-1 py-4">
                                {copied ? <><Check size={20} /> Copied</> : <><Copy size={20} /> Copy Link</>}
                            </Button>
                            <Button onClick={() => onGenerate(permission)} className="flex-1 py-4" isLoading={isLoading}>Regenerate</Button>
                        </div>
                    </div>
                ) : (
                    <Button onClick={() => onGenerate(permission)} className="w-full py-4" isLoading={isLoading}>Generate Link</Button>
                )}
            </div>
        </Modal>
    );
};

export default ShareModal;
