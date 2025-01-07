import { getToken } from "next-auth/jwt";
import { NextRequest, NextResponse } from "next/server";

export async function middleware(req: NextRequest) {
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
    const { pathname } = req.nextUrl;

    const isAuthPage =
        pathname === "/sign-in" ||
        pathname === "/user-register" ||
        pathname === "/mail-verify" ||
        pathname === "/on-boarding" ||
        pathname === "/forgot-password" ||
        pathname === "/reset-password" ||
        pathname === "/verification-mail";
        return NextResponse.next();
    // Handle CORS preflight (OPTIONS method)
    if (req.method === "OPTIONS") {
        const response = NextResponse.next();
        response.headers.set("Access-Control-Allow-Credentials", "true");
        response.headers.set("Access-Control-Allow-Origin", "*"); // Change "*" to specific origin(s) for production
        response.headers.set("Access-Control-Allow-Methods", "GET,OPTIONS,POST,PUT");
        response.headers.set(
            "Access-Control-Allow-Headers",
            "Content-Type, Authorization"
        );
        return response;
    }

    // Skip API routes
    if (pathname.startsWith("/api/auth")) {
        return NextResponse.next();
    }

    if (token && isAuthPage) {
        const url = req.nextUrl.clone();
        url.pathname = "/home";
        return NextResponse.redirect(url);
    }

    if (!token && !isAuthPage) {
        const url = req.nextUrl.clone();
        url.pathname = "/sign-in";
        return NextResponse.redirect(url);
    }

    if (pathname === "/") {
        const url = req.nextUrl.clone();
        url.pathname = "/home";
        return NextResponse.redirect(url);
    }

    // Add CORS headers globally
    const response = NextResponse.next();
    response.headers.set("Access-Control-Allow-Credentials", "true");
    response.headers.set("Access-Control-Allow-Origin", "*");
    response.headers.set("Access-Control-Allow-Methods", "GET,OPTIONS,POST,PUT");
    response.headers.set(
        "Access-Control-Allow-Headers",
        "Content-Type, Authorization"
    );
    return response;
}

export const config = {
    matcher: ["/((?!api/|_next/static|favicon.ico|assets/).*)"],
};
