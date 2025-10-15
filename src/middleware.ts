
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
  throw new Error('Please define the JWT_SECRET environment variable inside .env');
}

const SECRET_KEY = new TextEncoder().encode(JWT_SECRET);

// List of API routes that require admin privileges
const adminApiRoutes = [
  '/api/boxes',
  // '/api/brands', // This should be public
  '/api/notifications/broadcast',
  '/api/orders',
  // '/api/platform', // This MUST be public for the app to load
  '/api/products/bulk-update-stock',
  '/api/promotions',
  // '/api/reviews/like', // Liking should be for logged-in users, not just admins
  '/api/seed',
  '/api/settings',
  '/api/users',
];

async function verifyToken(token: string) {
  try {
    const { payload } = await jwtVerify(token, SECRET_KEY);
    return payload as { roles?: string[] };
  } catch (err) {
    return null;
  }
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Check if the request is for a protected admin API route
  const isProtectedAdminApi = adminApiRoutes.some(route => pathname.startsWith(route));

  if (isProtectedAdminApi) {
    const token = request.cookies.get('accessToken')?.value;

    if (!token) {
      return NextResponse.json({ message: 'Authentication required' }, { status: 401 });
    }

    const payload = await verifyToken(token);
    
    if (!payload || !payload.roles?.includes('admin')) {
      return NextResponse.json({ message: 'Forbidden: Admin access required' }, { status: 403 });
    }
  }

  return NextResponse.next();
}

// See "Matching Paths" below to learn more
export const config = {
  matcher: '/api/:path*',
};
