"use client";

import React from 'react';
import { Plus, Trash2, Edit2 } from 'lucide-react';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import { ChangeLog } from '../../types';

const ActivityLogModal = ({ isOpen, onClose, logs, onRevert, onRevertAll, isLoading }: { isOpen: boolean, onClose: () => void, logs: ChangeLog[], onRevert: (id: string) => void, onRevertAll: () => void, isLoading: boolean }) => {
    if (!isOpen) return null;

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Activity Log">
            <div className="flex justify-between items-center mb-6 bg-gray-50 dark:bg-gray-750 p-4 rounded-xl">
                <div>
                    <h4 className="font-bold text-gray-900 dark:text-white text-sm">External Changes</h4>
                    <p className="text-xs text-gray-500">Changes made by shared users</p>
                </div>
                {logs.length > 0 && (
                    <Button variant="danger" onClick={onRevertAll} className="py-2 px-4 text-xs font-bold" isLoading={isLoading}>
                        Take Back All Changes
                    </Button>
                )}
            </div>

            <div className="space-y-4 max-h-[50vh] overflow-y-auto">
                {logs.length === 0 ? (
                    <div className="text-center py-12 text-gray-400">No activity recorded yet.</div>
                ) : (
                    logs.map(log => (
                        <div key={log.id} className="flex justify-between items-start gap-4 p-4 border border-gray-100 dark:border-gray-700 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                            <div className="flex gap-3">
                                <div className={`mt-1 p-2 rounded-full shrink-0 ${log.action === 'add' ? 'bg-brand-green/10 text-brand-green' :
                                    log.action === 'delete' ? 'bg-brand-orange/10 text-brand-orange' :
                                        'bg-brand-blue/10 text-brand-blue'
                                    }`}>
                                    {log.action === 'add' ? <Plus size={14} /> : log.action === 'delete' ? <Trash2 size={14} /> : <Edit2 size={14} />}
                                </div>
                                <div>
                                    <p className="text-sm text-gray-900 dark:text-white font-medium">{log.description}</p>
                                    <p className="text-xs text-gray-500 mt-1">
                                        by <span className="font-bold">{log.actorName}</span> • {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}, {new Date(log.timestamp).toLocaleDateString()}
                                    </p>
                                </div>
                            </div>
                            <button
                                onClick={() => onRevert(log.id)}
                                disabled={isLoading}
                                className="text-gray-400 hover:text-gray-900 dark:hover:text-white text-xs font-bold px-3 py-1.5 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-white dark:hover:bg-gray-700 transition-colors"
                            >
                                Undo
                            </button>
                        </div>
                    ))
                )}
            </div>
        </Modal>
    );
};

export default ActivityLogModal;
