
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
    return payload;
  } catch (err) {
    return null;
  }
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get('accessToken')?.value;

  // For admin-specific API routes
  if (pathname.startsWith('/api/admin/')) {
      if (!token) {
          return NextResponse.json({ message: 'Authentication required' }, { status: 401 });
      }

      const payload = await verifyToken(token);
      
      if (!payload || !(payload.roles as string[])?.includes('admin')) {
          return NextResponse.json({ message: 'Forbidden: Admin access required' }, { status: 403 });
      }
  }

  return NextResponse.next();
}

// Updated matcher to be more broad and managed within the middleware logic
export const config = {
  matcher: [
    '/api/:path*',
  ],
};
