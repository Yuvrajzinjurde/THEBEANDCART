
import { NextResponse } from 'next/server';
import { serialize } from 'cookie';

export async function POST() {
    const accessTokenCookie = serialize('accessToken', '', {
        httpOnly: false, // Ensure this matches the login route
        secure: process.env.NODE_ENV !== 'development',
        sameSite: 'strict',
        expires: new Date(0),
        path: '/',
    });

    const refreshTokenCookie = serialize('refreshToken', '', {
        httpOnly: true,
        secure: process.env.NODE_ENV !== 'development',
        sameSite: 'strict',
        expires: new Date(0),
        path: '/',
    });

    const response = NextResponse.json({ message: 'Logout successful' });
    response.headers.append('Set-Cookie', accessTokenCookie);
    response.headers.append('Set-Cookie', refreshTokenCookie);

    return response;
}
