"use client";

import React from 'react';
import Link from 'next/link';
import Button from '../components/ui/Button';
import { Plane } from 'lucide-react';

export default function NotFound() {
    return (
        <div className="min-h-[80vh] flex flex-col items-center justify-center p-8 text-center">
            <div className="mb-6 p-6 bg-brand-blue/10 rounded-full text-brand-blue">
                <Plane size={64} className="rotate-45" />
            </div>
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4"> 404 - Trip Not Found </h1>
            <p className="text-gray-500 dark:text-gray-400 mb-8 max-w-md mx-auto">
                Oops! It looks like the page you&apos;re looking for has taken a detour. Let&apos;s get you back on track.
            </p>
            <Link href="/dashboard" passHref>
                <Button className="px-8 py-3"> Back to Dashboard </Button>
            </Link>
        </div>
    );
}
