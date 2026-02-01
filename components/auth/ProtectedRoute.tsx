"use client";

import React, { useContext, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { AuthContext } from '../../context/AppContext';

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
    const { user } = useContext(AuthContext);
    const router = useRouter();

    useEffect(() => {
        if (!user) {
            router.push('/login');
        }
    }, [user, router]);

    return user ? <>{children}</> : null;
};

export default ProtectedRoute;
