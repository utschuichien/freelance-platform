import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const protectedRoutes = ['/projects/create', '/profile'];
const authRoutes = ['/login', '/register'];

export function proxy(request: NextRequest) {
    const token = request.cookies.get('accessToken')?.value;
    const path = request.nextUrl.pathname;

    const isProtectedRoute = protectedRoutes.some((route) => path.startsWith(route));

    if (isProtectedRoute && !token) {
        return NextResponse.redirect(new URL('/login', request.url));
    }

    if (authRoutes.some((route) => path.startsWith(route)) && token) {
        return NextResponse.redirect(new URL('/', request.url));
    }

    return NextResponse.next();
}

export const config = {
    matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
