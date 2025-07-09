// src/middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
    const userCookie = request.cookies.get('user');
    let user = null;

    if (userCookie) {
        try {
            user = JSON.parse(userCookie.value);
        } catch (e) {
            console.error('Error parsing user cookie in middleware:', e);
            const response = NextResponse.redirect(new URL('/login', request.url));
            response.cookies.delete('user');
            return response;
        }
    }

    const isAdmin = user?.rol === 'ADMIN';
    const isLoginPage = request.nextUrl.pathname === '/login';
    const isAdminRoute = request.nextUrl.pathname.startsWith('/admin');
    const isRootPage = request.nextUrl.pathname === '/';

    if (isLoginPage && user) {
        if (isAdmin) {
            return NextResponse.redirect(new URL('/admin/usuarios', request.url));
        } else {
            return NextResponse.next();
        }
    }

    if (isRootPage && !user) {
        return NextResponse.redirect(new URL('/login', request.url));
    }

    if (isAdminRoute) {
        if (!user) {
            return NextResponse.redirect(new URL('/login', request.url));
        }
        if (!isAdmin) {
            const response = NextResponse.redirect(new URL('/login', request.url));
            response.cookies.delete('user');
            return response;
        }
    }

    return NextResponse.next();
}

export const config = {
    matcher: ['/', '/login', '/admin/:path*'],
};