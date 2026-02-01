"use client";

import React from 'react';
import { useParams } from 'next/navigation';
import ProtectedRoute from '../../../../components/auth/ProtectedRoute';
import ActivityEventDetail from '../../../../components/activities/ActivityEventDetail';

export default function ActivitiesMoviesEventPage() {
    const params = useParams();
    const eventname = params.eventname as string;

    return (
        <ProtectedRoute>
            <div className="relative min-h-screen">
                <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-brand-blue/10 via-white to-white dark:from-brand-blue/5 dark:via-gray-900 dark:to-gray-900" />
                <ActivityEventDetail eventId={eventname} backHref="/activities/movies" />
            </div>
        </ProtectedRoute>
    );
}
