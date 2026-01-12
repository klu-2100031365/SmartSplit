"use client";

import React, { useState, useEffect } from 'react';
import { Upload, X } from 'lucide-react';
import Image from 'next/image';
import Modal from '../ui/Modal';
import Input from '../ui/Input';
import Button from '../ui/Button';
import { TRIP_ICONS } from '../../lib/constants';
import { Trip } from '../../types';

interface AddTripModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (name: string, icon: string, customImage?: string) => Promise<void>;
    editingTrip?: Trip | null;
}

const AddTripModal = ({ isOpen, onClose, onSave, editingTrip }: AddTripModalProps) => {
    const [name, setName] = useState('');
    const [selectedIcon, setSelectedIcon] = useState<string>('plane');
    const [customImage, setCustomImage] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (editingTrip) {
            setName(editingTrip.name);
            setSelectedIcon(editingTrip.icon || 'plane');
            setCustomImage(editingTrip.customImage || null);
        } else {
            setName('');
            setSelectedIcon('plane');
            setCustomImage(null);
        }
    }, [editingTrip, isOpen]);

    const handleSave = async () => {
        if (!name) return;
        setIsLoading(true);
        try {
            await onSave(name, selectedIcon, customImage || undefined);
            onClose();
        } finally {
            setIsLoading(false);
        }
    };

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            if (file.size > 500000) {
                alert("File is too large. Please upload an image under 500KB.");
                return;
            }
            const reader = new FileReader();
            reader.onloadend = () => setCustomImage(reader.result as string);
            reader.readAsDataURL(file);
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={editingTrip ? "Edit Trip" : "Create New Trip"}>
            <div className="space-y-6">
                <Input
                    label="Trip Name"
                    placeholder="e.g. Goa Vacation 2024"
                    value={name}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setName(e.target.value)}
                    autoFocus
                    required
                />
                <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3"> Choose Icon or Upload Image <span className="text-red-500 ml-0.5">*</span> </label>
                    <div className="mb-4">
                        <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl cursor-pointer bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-750 transition-colors overflow-hidden relative">
                            {customImage ? (
                                <Image src={customImage} alt="Preview" className="w-full h-full object-cover" width={400} height={300} />
                            ) : (
                                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                    <Upload className="w-8 h-8 mb-2 text-gray-400" />
                                    <p className="text-sm text-gray-500 dark:text-gray-400"> <span className="font-semibold" > Click to upload </span> custom image</p >
                                    <p className="text-xs text-gray-400 mt-1"> PNG, JPG(Max 500KB) </p>
                                </div>
                            )}
                            <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} />
                            {customImage && (
                                <button
                                    onClick={(e) => { e.preventDefault(); e.stopPropagation(); setCustomImage(null); }}
                                    className="absolute top-2 right-2 bg-black/50 text-white p-1 rounded-full hover:bg-black/70"
                                >
                                    <X size={16} />
                                </button>
                            )}
                        </label>
                    </div>
                    {!customImage && (
                        <div className="grid grid-cols-4 gap-3">
                            {Object.entries(TRIP_ICONS).map(([key, Icon]) => (
                                <button
                                    key={key}
                                    onClick={() => setSelectedIcon(key)}
                                    className={`p-3 rounded-xl flex items-center justify-center transition-all border ${selectedIcon === key
                                        ? 'bg-brand-blue/10 border-brand-blue text-brand-blue'
                                        : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-750'
                                        }`}
                                >
                                    <Icon size={24} />
                                </button>
                            ))}
                        </div>
                    )}
                </div>
                <Button onClick={handleSave} className="w-full py-4 text-lg" isLoading={isLoading}> {editingTrip ? "Save Changes" : "Create Trip"} </Button>
            </div>
        </Modal>
    );
};

export default AddTripModal;
