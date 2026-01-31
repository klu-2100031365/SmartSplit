"use client";

import React from 'react';
import { X } from 'lucide-react';

const Modal = ({ isOpen, onClose, title, children }: { isOpen: boolean, onClose: () => void, title: string, children: React.ReactNode }) => {
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-gray-950/40 backdrop-blur-md animate-in fade-in duration-200">
            <div className="bg-white dark:bg-gray-800 w-full max-w-xl rounded-[40px] shadow-2xl border border-gray-100 dark:border-gray-700 overflow-hidden animate-in zoom-in-95 duration-200">
                <div className="flex justify-between items-center p-6 sm:p-8 border-b border-gray-50 dark:border-gray-750">
                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{title}</h3>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors text-gray-500">
                        <X size={24} />
                    </button>
                </div>
                <div className="p-6 sm:p-8 max-h-[85vh] overflow-y-auto">
                    {children}
                </div>
            </div>
        </div>
    );
};

export default Modal;
