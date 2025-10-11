
import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';
import dbConnect from '@/lib/mongodb';
import User from '@/models/user.model';
import Role from '@/models/role.model';
import { serialize } from 'cookie';

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET;

if (!JWT_SECRET || !JWT_REFRESH_SECRET) {
  throw new Error('Please define JWT_SECRET and JWT_REFRESH_SECRET environment variables inside .env');
}

export async function GET(req: NextRequest) {
    await dbConnect();
    const cookieStore = cookies();
    let accessToken = cookieStore.get('accessToken')?.value;
    const refreshToken = cookieStore.get('refreshToken')?.value;

    if (!accessToken && !refreshToken) {
        return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    let decodedAccessToken;
    if (accessToken) {
        try {
            decodedAccessToken = jwt.verify(accessToken, JWT_SECRET) as jwt.JwtPayload;
        } catch (error) {
            // Access token expired or invalid
            decodedAccessToken = null;
        }
    }

    if (decodedAccessToken) {
        return NextResponse.json({ user: decodedAccessToken });
    }
    
    // If access token is expired, try to refresh it
    if (!refreshToken) {
        return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    try {
        const decodedRefreshToken = jwt.verify(refreshToken, JWT_REFRESH_SECRET) as jwt.JwtPayload;
        const user = await User.findById(decodedRefreshToken.userId).populate({ path: 'roles', model: Role });

        if (!user) {
            return NextResponse.json({ message: 'Invalid token' }, { status: 401 });
        }
        
        const userRoles = user.roles.map((role: any) => role.name);

        const newAccessToken = jwt.sign(
            { userId: user._id, roles: userRoles, name: user.firstName, brand: user.brand },
            JWT_SECRET,
            { expiresIn: '15m' }
        );

        const accessTokenCookie = serialize('accessToken', newAccessToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV !== 'development',
            sameSite: 'strict',
            maxAge: 60 * 15,
            path: '/',
        });

        const response = NextResponse.json({ user: {
            userId: user._id,
            roles: userRoles,
            name: user.firstName,
            brand: user.brand,
        }});
        
        response.headers.set('Set-Cookie', accessTokenCookie);
        
        return response;

    } catch (error) {
        // Clear cookies if refresh token is invalid
        const expiredAccessTokenCookie = serialize('accessToken', '', { httpOnly: true, maxAge: -1, path: '/' });
        const expiredRefreshTokenCookie = serialize('refreshToken', '', { httpOnly: true, maxAge: -1, path: '/' });
        
        const response = NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
        response.headers.append('Set-Cookie', expiredAccessTokenCookie);
        response.headers.append('Set-Cookie', expiredRefreshTokenCookie);

        return response;
    }
}
