
'use server';

import type { IUser } from '@/models/user.model';

export async function getUsers(brand: string): Promise<IUser[]> {
    try {
        // In a real app, you'd want to use a more secure way to get the base URL
        const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:9002';
        const url = new URL('/api/users', baseUrl);
        if (brand) {
            url.searchParams.append('brand', brand);
        }

        const response = await fetch(url.toString());

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Failed to fetch users');
        }
        
        const data = await response.json();
        return JSON.parse(JSON.stringify(data.users));

    } catch (error) {
        console.error('Failed to fetch users:', error);
        throw new Error('Could not fetch users from the server.');
    }
}


export async function updateUserStatus(userId: string, status: 'active' | 'blocked'): Promise<IUser> {
     try {
        const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:9002';
        const url = new URL(`/api/users`, baseUrl);
        url.searchParams.append('userId', userId);

        const response = await fetch(url.toString(), {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ status }),
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Failed to update user status');
        }
        
        const data = await response.json();
        return JSON.parse(JSON.stringify(data.user));

    } catch (error) {
        console.error('Failed to update user status:', error);
        throw new Error('Could not update user status on the server.');
    }
}
