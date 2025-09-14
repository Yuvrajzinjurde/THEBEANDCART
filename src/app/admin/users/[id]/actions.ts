
'use server';

import type { IUser } from '@/models/user.model';
import type { IOrder } from '@/models/order.model';

export interface UserDetails {
    user: IUser;
    orders: IOrder[];
}

export async function getUserDetails(userId: string): Promise<UserDetails> {
    try {
        const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:9002';
        const url = new URL(`/api/users/${userId}/details`, baseUrl);
        
        const response = await fetch(url.toString());

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Failed to fetch user details');
        }
        
        const data = await response.json();
        return JSON.parse(JSON.stringify(data));

    } catch (error) {
        console.error('Failed to fetch user details:', error);
        throw new Error('Could not fetch user details from the server.');
    }
}
