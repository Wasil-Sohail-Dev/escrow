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
];

// API routes that are public
const PUBLIC_API_ROUTES = [
    "/api/auth/login",
    "/api/auth",
    "/api/auth/",
    "/api/auth/**", // Allow all NextAuth authentication routes
    "/api/user-login",
    "/api/register",
    "/api/forgot-password-link",
    "/api/reset-password-link",
    "/api/reset-password",
    "/api/save-onboarding",
    "/api/send-mail-code",
    "/api/verify-mail-code",
];


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
    const isOnboardingPage = pathname === ONBOARDING_PAGE;

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
        // Check if user needs onboarding (based on userStatus in token)
        const needsOnboarding = token.userStatus === "verified" || !token.userStatus;

        if (token.userStatus === "active" && isOnboardingPage) {
            const url = req.nextUrl.clone();
            url.pathname = HOME_PAGE;
            return NextResponse.redirect(url);
        }

        if (needsOnboarding && !isOnboardingPage) {
            const url = req.nextUrl.clone();
            url.pathname = ONBOARDING_PAGE;

            const tokenData = {
                email: token.email,
                userType: token.userType,
                userStatus: token.userStatus,
            };

            const response = NextResponse.redirect(url);
            response.cookies.set("TpAuthToken", JSON.stringify(tokenData), {
                httpOnly: false,
                secure: process.env.NODE_ENV === "production",
                sameSite: "lax",
                maxAge: 60 * 60, // 1 hour
            });

            return response;
        }

        // If user is verified and trying to access auth pages or onboarding
        if (!needsOnboarding && (isPublicPage || isOnboardingPage)) {
            const url = req.nextUrl.clone();
            url.pathname = HOME_PAGE;
            return NextResponse.redirect(url);
        }
    }

    // Redirect root "/" to home
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
