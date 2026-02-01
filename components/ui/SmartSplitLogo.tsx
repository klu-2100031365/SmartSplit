"use client";

import React from 'react';

const SmartSplitLogo = () => (
  <div className="w-10 h-10 flex items-center justify-center filter drop-shadow-sm transition-transform hover:scale-105">
    <svg viewBox="0 0 32 32" className="w-full h-full" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="logo_grad" x1="2" y1="32" x2="32" y2="2" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#8B5CF6" /> {/* Violet */}
          <stop offset="50%" stopColor="#EC4899" /> {/* Pink */}
          <stop offset="100%" stopColor="#F97316" /> {/* Orange */}
        </linearGradient>
      </defs>
      
      {/* Analytics Bars */}
      <rect x="7" y="9" width="4" height="6" rx="1" fill="url(#logo_grad)" />
      <rect x="14" y="5" width="4" height="10" rx="1" fill="url(#logo_grad)" />
      <rect x="21" y="2" width="4" height="13" rx="1" fill="url(#logo_grad)" />
      
      {/* Wallet Body Main */}
      <path d="M2 16C2 13.2386 4.23858 11 7 11H29C30.6569 11 32 12.3431 32 14V29C32 30.6569 30.6569 32 29 32H7C4.23858 32 2 29.7614 2 27V16Z" fill="url(#logo_grad)" />
      
      {/* Clasp/Strap */}
      <path d="M32 19H26C24.3431 19 23 20.3431 23 22V24C23 25.6569 24.3431 27 26 27H32" fill="white" />
      <circle cx="27.5" cy="23" r="1.5" fill="#EC4899" />
    </svg>
  </div>
);

export default SmartSplitLogo;
