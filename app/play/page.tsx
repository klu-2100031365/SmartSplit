"use client";

import React, { useContext, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Gamepad2, Plus } from 'lucide-react';
import { AuthContext, CurrencyContext } from '../../context/AppContext';
import { api, slugify } from '../../lib/utils';
import { Trip } from '../../types';
import Button from '../../components/ui/Button';
import ProtectedRoute from '../../components/auth/ProtectedRoute';
import TripCard from '../../components/cards/TripCard';
import AddTripModal from '../../components/modals/AddTripModal';

const PlayPage = () => {
    const { user } = useContext(AuthContext);
    const { symbol } = useContext(CurrencyContext);
    const router = useRouter();
    const [events, setEvents] = useState<Trip[]>([]);
    const [shares, setShares] = useState<Record<string, number>>({});
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    const refresh = () => {
        if (!user) return;
        setIsLoading(true);
        Promise.all([
            api.getPlayEvents(user.id),
            api.getUserTripExpenses(user.id)
        ])
            .then(([data, shareMap]) => {
                setEvents(data);
                setShares(shareMap);
            })
            .finally(() => setIsLoading(false));
    };

    useEffect(() => {
        refresh();
    }, [user]);

    const handleCreateEvent = async (name: string, icon: string, image?: string) => {
        if (!user) return;
        try {
            await api.createTrip(user.id, name, icon, image, 'play');
            refresh();
            setIsAddModalOpen(false);
        } catch (error) {
            console.error("Failed to create playtime event", error);
        }
    };

    const handleDelete = async (id: string) => {
        if (!user || !confirm('Delete this event?')) return;
        await api.deleteTrip(user.id, id);
        refresh();
    };

    return (
        <ProtectedRoute>
            <div className="p-4 sm:p-8 max-w-[1200px] mx-auto min-h-screen pb-24">
                <div className="flex items-center justify-between mb-8 gap-4">
                    <div className="flex items-center gap-4 min-w-0">
                        <button
                            onClick={() => router.push('/activities')}
                            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors shrink-0"
                        >
                            <ArrowLeft size={24} className="text-gray-600 dark:text-gray-300" />
                        </button>
                        <div className="min-w-0">
                            <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                                <Gamepad2 className="text-brand-green" /> Play & Chill
                            </h1>
                            <p className="text-gray-500 dark:text-gray-400 text-sm">Create playtime events & split costs</p>
                        </div>
                    </div>

                    <Button
                        onClick={() => setIsAddModalOpen(true)}
                        className="rounded-full px-6 py-3 shadow-lg hover:shadow-xl transition-all whitespace-nowrap"
                    >
                        <Plus size={20} /> New Event
                    </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {isLoading ? (
                        <p className="text-center text-gray-500 py-10 col-span-full">Loading events...</p>
                    ) : events.length === 0 ? (
                        <div className="col-span-full text-center py-20 bg-gray-50 dark:bg-gray-800/50 rounded-3xl border border-dashed border-gray-200 dark:border-gray-700">
                            <Gamepad2 size={64} className="mx-auto text-gray-300 dark:text-gray-600 mb-6" />
                            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">No playtime events yet</h3>
                            <p className="text-gray-500 dark:text-gray-400 mb-8">Start one for badminton, bowling, go-karting, or anything fun.</p>
                            <Button onClick={() => setIsAddModalOpen(true)}>Create First Event</Button>
                        </div>
                    ) : (
                        events.map(event => (
                            <TripCard
                                key={event.id}
                                trip={event}
                                userShare={shares[event.id]}
                                symbol={symbol}
                                onClick={() => router.push(`/trips/${slugify(event.name)}`)}
                                onDelete={() => handleDelete(event.id)}
                            />
                        ))
                    )}
                </div>

                <AddTripModal
                    isOpen={isAddModalOpen}
                    onClose={() => setIsAddModalOpen(false)}
                    onSave={handleCreateEvent}
                    defaultIcon="gamepad"
                    title="Create Playtime Event"
                />
            </div>
        </ProtectedRoute>
    );
};

export default PlayPage;
