"use client";

import React, { useContext, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Plane } from 'lucide-react';
import { AuthContext, CurrencyContext } from '../../context/AppContext';
import { api } from '../../lib/api';
import { slugify } from '../../lib/slugify';
import { Trip } from '../../types';
import Button from '../../components/ui/Button';
import TripCard from '../../components/cards/TripCard';
import AddTripModal from '../../components/modals/AddTripModal';

const TripsList = () => {
    const { user } = useContext(AuthContext);
    const { symbol } = useContext(CurrencyContext);
    const router = useRouter();
    const [trips, setTrips] = useState<Trip[]>([]);
    const [shares, setShares] = useState<Record<string, number>>({});
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingTrip, setEditingTrip] = useState<Trip | null>(null);

    const loadTrips = () => {
        if (user) {
            Promise.all([
                api.getTrips(user.id),
                api.getUserTripExpenses(user.id)
            ]).then(([tripList, shareMap]) => {
                setTrips(tripList);
                setShares(shareMap);
            });
        }
    };

    useEffect(loadTrips, [user]);

    const handleSaveTrip = async (name: string, icon: string, image?: string) => {
        if (!user) return;
        if (editingTrip) {
            await api.updateTrip(user.id, editingTrip.id, name, icon, image);
        } else {
            await api.createTrip(user.id, name, icon, image);
        }
        setEditingTrip(null);
        loadTrips();
    };

    const handleDelete = async (tripId: string) => {
        if (confirm('Are you sure you want to delete this trip? This action cannot be undone.')) {
            if (user) {
                await api.deleteTrip(user.id, tripId);
                loadTrips();
            }
        }
    };

    return (
        <div className="p-4 sm:p-8 max-w-[1600px] mx-auto min-h-screen">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 mb-10">
                <div>
                    <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white"> My Trips </h1>
                    <p className="text-gray-500 dark:text-gray-400 mt-2 text-base sm:text-lg"> Manage expenses for your travels.</p>
                </div>
                <Button onClick={() => setIsModalOpen(true)} className="w-full sm:w-auto px-8 py-4">
                    <Plus size={20} /> New Trip
                </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {trips.map(trip => (
                    <TripCard
                        key={trip.id}
                        trip={trip}
                        userShare={shares[trip.id]}
                        symbol={symbol}
                        onClick={() => router.push(`/trips/${slugify(trip.name)}`)}
                        onDelete={() => handleDelete(trip.id)}
                        onEdit={() => {
                            setEditingTrip(trip);
                            setIsModalOpen(true);
                        }}
                    />
                ))}
                {trips.length === 0 && (
                    <div className="col-span-full py-32 text-center">
                        <div className="inline-flex p-6 bg-gray-100 dark:bg-gray-800 rounded-full text-gray-400 mb-6">
                            <Plane size={48} />
                        </div>
                        <p className="text-xl text-gray-500 dark:text-gray-400"> No trips yet.</p>
                    </div>
                )}
            </div>

            <AddTripModal
                isOpen={isModalOpen}
                onClose={() => {
                    setIsModalOpen(false);
                    setEditingTrip(null);
                }}
                onSave={handleSaveTrip}
                editingTrip={editingTrip}
            />
        </div>
    );
};

export default TripsList;
