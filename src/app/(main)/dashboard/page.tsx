

"use client";

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

// This page just redirects to the profile page, which is the default dashboard view.
export default function DashboardRedirectPage() {
    const router = useRouter();
    useEffect(() => {
        router.replace('/dashboard/profile');
    }, [router]);
    
    return null; // Or a loading spinner
}
