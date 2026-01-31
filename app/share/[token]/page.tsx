"use client";

import React, { useContext, useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { AuthContext } from '../../../context/AppContext';
import { api } from '../../../lib/api';
import TripDetail from '../../../components/trips/TripDetail';
import Card from '../../../components/ui/Card';
import Input from '../../../components/ui/Input';
import Button from '../../../components/ui/Button';
import { Trip, Participant } from '../../../types';

const SharedTripHandler = () => {
    const params = useParams();
    const token = params.token as string;
    const { user, guestName, setGuestName } = useContext(AuthContext);
    const [tripData, setTripData] = useState<{ trip: Trip, participants: Participant[] } | null>(null);
    const [name, setName] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        api.getTripByShareToken(token)
            .then(setTripData)
            .catch((e: unknown) => {
                const err = e as Error;
                setError(err.message);
            })
            .finally(() => setLoading(false));
    }, [token]);

    const handleJoin = () => {
        if (name.trim()) setGuestName(name);
    };

    if (loading) return <div className="p-8">Loading shared trip...</div>;
    if (error) return <div className="p-8 text-brand-orange">Error: {error}</div>;

    if (!user && !guestName) {
        return (
            <div className="min-h-screen flex items-center justify-center p-6 bg-gray-50 dark:bg-gray-900">
                <Card className="w-full max-w-md text-center">
                    <h3 className="text-2xl font-bold mb-4"> Join Trip </h3>
                    <p className="text-gray-500 mb-8"> You&apos;ve been invited to <span className="text-brand-blue font-bold"> {tripData?.trip.name} </span>. Enter your name to continue as a guest. </p>
                    <Input
                        placeholder="Your Name"
                        value={name}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setName(e.target.value)}
                        className="mb-6"
                    />
                    <Button onClick={handleJoin} className="w-full"> Continue </Button>
                </Card>
            </div>
        );
    }

    if (!tripData) return <div className="p-8">Trip not found.</div>;

    return <TripDetail tripId={tripData.trip.id} isSharedView={true} />;
};

export default SharedTripHandler;
