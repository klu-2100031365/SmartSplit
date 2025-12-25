"use client";

import React, { useState } from 'react';
import { Plane, Trash2, ArrowRight } from 'lucide-react';
import Image from 'next/image';
import { TRIP_ICONS } from '../../lib/constants';
import { formatDateWithDay } from '../../lib/formatters';
import { Trip } from '../../types';

const TripCard: React.FC<{ trip: Trip, onClick: () => void, onDelete?: () => void }> = ({ trip, onClick, onDelete }) => {
    const [isAnimating, setIsAnimating] = useState(false);

    const handleClick = () => {
        if (isAnimating) return;
        setIsAnimating(true);
        setTimeout(() => {
            onClick();
            setTimeout(() => setIsAnimating(false), 200);
        }, 1000);
    };

    const IconComponent = trip.icon ? (TRIP_ICONS[trip.icon as keyof typeof TRIP_ICONS] || Plane) : Plane;

    return (
        <div
            onClick={handleClick}
            className="relative bg-white dark:bg-gray-800 p-8 rounded-3xl border border-gray-100 dark:border-gray-700 hover:border-brand-blue dark:hover:border-brand-blue hover:shadow-2xl cursor-pointer transition-all flex justify-between items-center group h-40"
        >
            {onDelete && (
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        onDelete();
                    }}
                    className="absolute top-3 right-3 p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-full transition-all z-20 opacity-100 md:opacity-0 md:group-hover:opacity-100"
                    title="Delete Trip"
                >
                    <Trash2 size={20} />
                </button>
            )}

            <div className="relative z-10 flex justify-between items-center w-full">
                <div>
                    <div className="flex items-center gap-4 mb-3">
                        <div className={`
                            w-16 h-16 rounded-xl relative overflow-hidden transition-all flex items-center justify-center shrink-0
                            bg-brand-blue/10 text-brand-blue
                        `}>
                            {trip.customImage ? (
                                <Image src={trip.customImage} alt="trip icon" className="w-full h-full object-cover" width={64} height={64} />
                            ) : (
                                <>
                                    <div className={`absolute inset-0 bg-brand-blue origin-bottom transition-transform ease-in-out z-0 
                                        ${isAnimating ? 'scale-y-100 duration-1000' : 'scale-y-0 duration-300 group-hover:scale-y-100'}`}
                                    />
                                    <div className={`relative z-10 transition-colors duration-300 ${isAnimating ? 'text-white' : 'group-hover:text-white'}`}>
                                        <IconComponent size={32} />
                                    </div>
                                </>
                            )}
                        </div>
                        <h3 className="font-bold text-2xl text-gray-900 dark:text-white">{trip.name}</h3>
                    </div>
                    <span className="text-base ml-1 text-gray-500 dark:text-gray-400">
                        {formatDateWithDay(trip.createdAt)}
                    </span>
                </div>
                <div className="p-3 rounded-full bg-gray-50 dark:bg-gray-700 text-gray-400 group-hover:bg-brand-blue group-hover:text-white transition-colors duration-300">
                    <ArrowRight size={24} />
                </div>
            </div>
        </div>
    );
};

export default TripCard;
