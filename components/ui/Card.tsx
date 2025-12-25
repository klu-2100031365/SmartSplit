"use client";

import React from 'react';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
    children: React.ReactNode;
}

const Card = ({ children, className = '', onClick }: CardProps) => (
    <div
        onClick={onClick}
        className={`bg-white dark:bg-gray-800 rounded-[32px] p-8 transition-colors ${onClick ? 'cursor-pointer' : ''} ${className}`}
    >
        {children}
    </div>
);

export default Card;
