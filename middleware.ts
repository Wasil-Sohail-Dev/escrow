import { getToken } from "next-auth/jwt";
import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";

// Public routes (accessible without authentication)
const PUBLIC_ROUTES = [
    "/",
    "/sign-in",
    "/sign-up",
    "/user-register",
    "/select-usertype",
    "/mail-verify",
    "/on-boarding",
    "/reset-password",
    "/reset-success",
    "/forgot-password",
    "/term-condition",
];

// API routes that are public
const PUBLIC_API_ROUTES = [
    "/api/auth/login",
    "/api/auth",
    "/api/auth/",
    "/api/auth/**", // Allow all NextAuth authentication routes
    "/api/user-login",
    "/api/register",
    "/api/forget-password-link",
    "/api/reset-password-link",
    "/api/reset-password",
    "/api/save-onboarding",
    "/api/send-mail-code",
    "/api/verify-mail-code",
    "/api/verify-reset-code",
];

const MAIL_VERIFY_PAGE = "/mail-verify";
const ONBOARDING_PAGE = "/on-boarding";
const HOME_PAGE = "/home";

export async function middleware(req: NextRequest) {
    const { pathname } = req.nextUrl;

    // Skip middleware for the Stripe webhook
    if (pathname === "/api/escrow-stripe-webhook") {
        console.log("Skipping middleware for webhook.");
        return NextResponse.next();
    }

    // Handle CORS preflight (OPTIONS method)
    if (req.method === "OPTIONS") {
        const response = new NextResponse(null, { status: 204 });
        setCorsHeaders(response);
        return response;
    }

    // Extract token for authentication
    const webToken = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
    const mobileToken = req.headers.get("Authorization")?.replace("Bearer ", "");
    let tokenPayload: any = null;

    if (mobileToken) {
        try {
            tokenPayload = jwt.verify(mobileToken, process.env.NEXTAUTH_SECRET!);
        } catch (error) {
            return NextResponse.json({ message: error || "Invalid Token" }, { status: 403 });
        }
    }

    const token = webToken || tokenPayload;
    const isPublicPage = PUBLIC_ROUTES.includes(pathname);
    const isPublicApiRoute = PUBLIC_API_ROUTES.some(route => pathname.startsWith(route));

    // Allow public API routes without authentication
    if (isPublicApiRoute) {
        return NextResponse.next();
    }

    // If user is not authenticated and trying to access protected routes
    if (!token && !isPublicPage) {
        if (pathname.startsWith("/api")) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        } else {
            const url = req.nextUrl.clone();
            url.pathname = "/sign-in";
            return NextResponse.redirect(url);
        }
    }

    // If user is authenticated
    if (token) {
        const userStatus = token.userStatus;

        // Redirect users based on their status
        if (userStatus === "pendingVerification" && pathname !== MAIL_VERIFY_PAGE) {
            console.log("Redirecting to Mail Verification Page");
            return NextResponse.redirect(new URL(MAIL_VERIFY_PAGE, req.url));
        }

        if (userStatus === "verified" && pathname !== ONBOARDING_PAGE) {
            console.log("Redirecting to Onboarding Page");
            return NextResponse.redirect(new URL(ONBOARDING_PAGE, req.url));
        }

        if (userStatus === "active" && pathname !== HOME_PAGE && isPublicPage) {
            console.log("Redirecting to Home Page");
            return NextResponse.redirect(new URL(HOME_PAGE, req.url));
        }

        if (userStatus === "adminInactive" || userStatus === "userInactive") {
            console.log("Access blocked for inactive users");
            return NextResponse.json({ message: "Access Denied: Your account is inactive" }, { status: 403 });
        }
    }

    // Redirect root "/" to home if authenticated
    if (pathname === "/") {
        const url = req.nextUrl.clone();
        url.pathname = HOME_PAGE;
        return NextResponse.redirect(url);
    }

    // Role-based route restriction (Example: Prevent vendors from accessing create-contract)
    if (token?.userType === "vendor" && pathname === "/create-contract") {
        const url = req.nextUrl.clone();
        url.pathname = "/";
        return NextResponse.redirect(url);
    }

    // Create response with CORS headers
    const response = NextResponse.next();
    setCorsHeaders(response);
    return response;
}

// Function to set CORS headers
function setCorsHeaders(response: NextResponse) {
    response.headers.set("Access-Control-Allow-Credentials", "true");
    response.headers.set("Access-Control-Allow-Origin", "*");
    response.headers.set("Access-Control-Allow-Methods", "GET,OPTIONS,POST,PUT");
    response.headers.set("Access-Control-Allow-Headers", "Content-Type, Authorization");
}

export const config = {
    matcher: ["/((?!api/escrow-stripe-webhook|_next/static|favicon.ico|assets/).*)"],
};
