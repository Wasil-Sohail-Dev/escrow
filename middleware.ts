import { getToken } from "next-auth/jwt";
import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose"; // ✅ Use jose

export const config = {
    matcher: ["/((?!api/escrow-stripe-webhook|_next/static|favicon.ico|assets/).*)"],
};

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
    "/admin-login",
];

// API routes that are public
const PUBLIC_API_ROUTES = [
    "/api/auth/login",
    "/api/auth",
    "/api/auth/",
    "/api/auth/**",
    "/api/user-login",
    "/api/register",
    "/api/forget-password-link",
    "/api/reset-password-link",
    "/api/reset-password",
    "/api/save-onboarding",
    "/api/send-mail-code",
    "/api/verify-mail-code",
    "/api/verify-reset-code",
    "/api/admin-auth/signup",
    "/api/admin-auth/login",
    "/api/admin-auth/logout",
    "/api/admin-auth/user",
    "/api/get-user-profile",
    // "/api/manage-profile/upload-photo",
];

// Dashboard routes that require super_admin access
const SUPER_ADMIN_ROUTES = [
    "/dashboard",
    "/dashboard/users",
    "/dashboard/projects",
    "/dashboard/payments",
    "/dashboard/disputes",
    "/dashboard/verifications",
    "/dashboard/audit-logs",
    "/dashboard/settings",
];

const ONBOARDING_PAGE = "/on-boarding";
const HOME_PAGE = "/home";

// ✅ Function to verify JWT using jose
async function verifyToken(token: string) {
    try {
        const secret = new TextEncoder().encode(process.env.NEXTAUTH_SECRET);
        const { payload } = await jwtVerify(token, secret);
        return {
            id: payload.id as string,
            email: payload.email as string,
            firstName: payload.firstName as string,
            lastName: payload.lastName as string,
            userType: payload.userType as string,
            userStatus: payload.userStatus as string,
            permissions: payload.permissions as string[]
        };
    } catch (error: any) {
        console.error("JWT Verification Error:", error.message);
        return null;
    }
}

export async function middleware(req: NextRequest) {
    const { pathname } = req.nextUrl;

    if (pathname === "/api/escrow-stripe-webhook") {
        return NextResponse.next();
    }

    if (req.method === "OPTIONS") {
        const response = new NextResponse(null, { status: 204 });
        setCorsHeaders(response);
        return response;
    }

    let tokenPayload: any = null;

    // Try to get token from different sources
    const authHeader = req.headers.get("Authorization");
    const mobileToken = authHeader && authHeader.startsWith("Bearer ")
        ? authHeader.split(" ")[1]
        : null;

    // First try NextAuth token
    try {
        const nextAuthToken = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
        if (nextAuthToken) {
            tokenPayload = nextAuthToken;
        }
    } catch (error) {
        console.error("NextAuth token error:", error);
    }

    // If no NextAuth token, try custom JWT token
    if (!tokenPayload) {
        const sessionToken = req.cookies.get('next-auth.session-token')?.value;
        if (sessionToken) {
            try {
                tokenPayload = await verifyToken(sessionToken);
            } catch (error) {
                console.error("Session token error:", error);
            }
        }
    }

    // Finally, try mobile token
    if (!tokenPayload && mobileToken) {
        try {
            tokenPayload = await verifyToken(mobileToken);
        } catch (error) {
            console.error("Mobile token error:", error);
        }
    }

    const isPublicPage = PUBLIC_ROUTES.includes(pathname);
    const isPublicApiRoute = PUBLIC_API_ROUTES.some(route => pathname.startsWith(route));

    // Allow public routes
    if (isPublicApiRoute) {
        return NextResponse.next();
    }

    // Check authentication
    if (!tokenPayload && !isPublicPage) {
        if (pathname.startsWith("/api")) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        } else {
            const url = req.nextUrl.clone();
            url.pathname = "/sign-in";
            return NextResponse.redirect(url);
        }
    }

    if (tokenPayload) {
        // If user is super_admin, allow access to all routes except when inactive
        if (tokenPayload.userType === 'super_admin') {
            if (tokenPayload.userStatus === "adminInactive") {
                return NextResponse.json({ message: "Access Denied: Your account is inactive" }, { status: 403 });
            }
            // Allow super_admin to access all routes
            const response = NextResponse.next();
            setCorsHeaders(response);
            return response;
        }

        // For non-super_admin users, check route restrictions
        const isDashboardRoute = SUPER_ADMIN_ROUTES.some(route => pathname.startsWith(route));
        if (isDashboardRoute) {
            return NextResponse.json(
                { message: "Access Denied: Only super admins can access this route" },
                { status: 403 }
            );
        }

        // Handle other user types and statuses
        const userStatus = tokenPayload.userStatus;

        if (userStatus === "verified" && pathname !== ONBOARDING_PAGE) {
            return NextResponse.redirect(new URL(ONBOARDING_PAGE, req.url));
        }

        if (userStatus === "active" && pathname !== HOME_PAGE && isPublicPage) {
            return NextResponse.redirect(new URL(HOME_PAGE, req.url));
        }

        if (userStatus === "adminInactive" || userStatus === "userInactive") {
            return NextResponse.json({ message: "Access Denied: Your account is inactive" }, { status: 403 });
        }

        // Handle vendor-specific restrictions
        if (tokenPayload.userType === "vendor" && pathname === "/create-contract") {
            const url = req.nextUrl.clone();
            url.pathname = "/";
            return NextResponse.redirect(url);
        }
    }

    if (pathname === "/") {
        const url = req.nextUrl.clone();
        url.pathname = HOME_PAGE;
        return NextResponse.redirect(url);
    }

    const response = NextResponse.next();
    setCorsHeaders(response);
    return response;
}

function setCorsHeaders(response: NextResponse) {
    response.headers.set("Access-Control-Allow-Credentials", "true");
    response.headers.set("Access-Control-Allow-Origin", "*");
    response.headers.set("Access-Control-Allow-Methods", "GET,OPTIONS,POST,PUT");
    response.headers.set("Access-Control-Allow-Headers", "Content-Type, Authorization");
}
