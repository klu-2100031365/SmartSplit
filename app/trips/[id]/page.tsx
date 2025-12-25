"use client";

import React from 'react';
import { useParams } from 'next/navigation';
import TripDetail from '../../../components/trips/TripDetail';
import ProtectedRoute from '../../../components/auth/ProtectedRoute';

export default function TripDetailPage() {
    const params = useParams();
    const id = params.id as string;

    return (
        <ProtectedRoute>
            <TripDetail tripId={id} />
        </ProtectedRoute>
    );
}
