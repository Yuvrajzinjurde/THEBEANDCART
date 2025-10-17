
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
  throw new Error('Please define the JWT_SECRET environment variable inside .env');
}

const SECRET_KEY = new TextEncoder().encode(JWT_SECRET);

async function verifyToken(token: string) {
  try {
    const { payload } = await jwtVerify(token, SECRET_KEY);
    return payload as { roles?: string[] };
  } catch (err) {
    return null;
  }
}

export async function middleware(request: NextRequest) {
  // This middleware is now configured to ONLY run on the paths defined in the matcher below.
  // No need to check the path here.

  const token = request.cookies.get('accessToken')?.value;

  if (!token) {
    return NextResponse.json({ message: 'Authentication required' }, { status: 401 });
  }

  const payload = await verifyToken(token);
  
  if (!payload || !payload.roles?.includes('admin')) {
    return NextResponse.json({ message: 'Forbidden: Admin access required' }, { status: 403 });
  }

  // If token is valid and has admin role, proceed.
  return NextResponse.next();
}

// Configured to run ONLY on specific, protected admin API routes.
// Public routes like /api/products, /api/brands, etc., will NOT be affected.
export const config = {
  matcher: [
    '/api/boxes/:path*',
    '/api/notifications/broadcast',
    '/api/orders/:path*',
    '/api/products/bulk-update-stock',
    '/api/promotions/:path*',
    '/api/seed',
    '/api/settings',
    '/api/users/:path*',
    // Exclude public user routes that might be under /api/users
    // This is a more robust way to handle exclusions if needed, but for now we protect the whole path
  ],
};
