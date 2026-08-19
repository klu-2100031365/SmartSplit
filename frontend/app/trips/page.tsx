"use client";

import React, { useContext, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Plane } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { AuthContext, CurrencyContext } from '../../context/AppContext';
import { api } from '../../lib/api';
import { slugify } from '../../lib/slugify';
import { Trip } from '../../types';
import Button from '../../components/ui/Button';
import TripCard from '../../components/cards/TripCard';
import AddTripModal from '../../components/modals/AddTripModal';
import ProtectedRoute from '../../components/auth/ProtectedRoute';

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
        <ProtectedRoute>
        <div className="mx-auto min-h-screen max-w-[1600px] px-4 pb-8 pt-3 sm:px-8 sm:pb-10 sm:pt-4">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 mb-10">
                <div>
                    <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white"> My Trips </h1>
                    <p className="text-gray-500 dark:text-gray-400 mt-2 text-base sm:text-lg"> Manage expenses for your travels.</p>
                </div>
                <Button onClick={() => setIsModalOpen(true)} className="w-full sm:w-auto px-8 py-4">
                    <Plus size={20} /> New Trip
                </Button>
            </div>

            <motion.div 
                layout 
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
            >
                <AnimatePresence mode="popLayout">
                    {trips.map((trip, index) => (
                        <motion.div
                            key={trip.id}
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true, margin: "-50px" }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            transition={{ duration: 0.5, delay: index % 3 * 0.1 }}
                        >
                            <TripCard
                                trip={trip}
                                userShare={shares[trip.id]}
                                symbol={symbol}
                                onClick={() => router.push(`/trips/${trip.id}`)}
                                onDelete={() => handleDelete(trip.id)}
                                onEdit={() => {
                                    setEditingTrip(trip);
                                    setIsModalOpen(true);
                                }}
                            />
                        </motion.div>
                    ))}
                </AnimatePresence>
                
                {trips.length === 0 && (
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="col-span-full py-32 text-center"
                    >
                        <motion.div 
                            initial={{ scale: 0.8, rotate: -10 }}
                            animate={{ 
                                scale: [1, 1.1, 1],
                                rotate: [-10, 10, -10]
                            }}
                            transition={{ 
                                duration: 4,
                                repeat: Infinity,
                                ease: "easeInOut"
                            }}
                            className="inline-flex p-6 bg-gray-100 dark:bg-gray-800 rounded-full text-gray-400 mb-6"
                        >
                            <Plane size={48} />
                        </motion.div>
                        <p className="text-xl text-gray-500 dark:text-gray-400"> No trips yet.</p>
                    </motion.div>
                )}
            </motion.div>

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
        </ProtectedRoute>
    );
};

export default TripsList;
