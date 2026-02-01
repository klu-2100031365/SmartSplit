"use client";

import React from 'react';
import { AppProvider } from "../context/AppContext";
import ErrorBoundary from "../components/ui/ErrorBoundary";

export function Providers({ children }: { children: React.ReactNode }) {
    return (
        <ErrorBoundary>
            <AppProvider>
                {children}
            </AppProvider>
        </ErrorBoundary>
    );
}
