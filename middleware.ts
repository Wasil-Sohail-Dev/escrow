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
    "/"
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
    "/api/create-notification",
    "/api/get-user-verification",
    "/api/fetch-notifications",
    "/api/resend-otp",
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
const LOGIN_PAGE = "/sign-in";

// Add before PERMISSION_ROUTE_MAP
type PermissionType = 'view_analytics' | 'manage_users' | 'manage_admins' | 'manage_contracts' | 'manage_payments' | 'manage_disputes';

const PERMISSION_ROUTE_MAP: Record<PermissionType, string[]> = {
  view_analytics: ["/dashboard"],
  manage_users: [
    "/dashboard/users/vendors",
    "/dashboard/users/clients",
    "/dashboard/verifications"
  ],
  manage_admins: ["/dashboard/users/admins"],
  manage_contracts: ["/dashboard/projects"],
  manage_payments: ["/dashboard/payments", "/dashboard/permotion-code"],
  manage_disputes: ["/dashboard/disputes"]
};

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
    const isDashboardRoute = SUPER_ADMIN_ROUTES.some(route => pathname.startsWith(route));

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
            url.pathname = LOGIN_PAGE;
            url.search = `?redirect=${encodeURIComponent(pathname)}`;
            return NextResponse.redirect(url);
        }
    }

    console.log(tokenPayload);
    

    if (tokenPayload) {
        if (tokenPayload.userType.includes('admin') || tokenPayload.userType.includes('moderator')) {
            if (tokenPayload.userStatus === "inactive") {
                return NextResponse.json({ message: "Access Denied: Your account is inactive" }, { status: 403 });
            }

            // If user has 'all' permission, allow access to all dashboard routes
            if (tokenPayload.permissions.includes('all')) {
                const response = NextResponse.next();
                setCorsHeaders(response);
                return response;
            }

            // Check if the current path matches any protected routes
            const currentPath = req.nextUrl.pathname;
            let hasPermission = false;

            // Check each permission the user has
            for (const permission of tokenPayload.permissions as PermissionType[]) {
                const allowedRoutes = PERMISSION_ROUTE_MAP[permission];
                if (allowedRoutes) {
                    // Check if current path starts with any of the allowed routes
                    hasPermission = allowedRoutes.some((route: string) => 
                        currentPath === route || currentPath.startsWith(`${route}/`)
                    );
                    if (hasPermission) break;
                }
            }

            // If path requires permission but user doesn't have it
            if (!hasPermission && Object.values(PERMISSION_ROUTE_MAP).flat().some(route => 
                currentPath === route || currentPath.startsWith(`${route}/`)
            )) {
                // Find the first accessible route based on user's permissions
                let redirectPath = "/dashboard"; // Default fallback
                
                // Check permissions in priority order
                if (tokenPayload.permissions.includes("view_analytics")) {
                    redirectPath = "/dashboard";
                } else if (tokenPayload.permissions.includes("manage_users")) {
                    redirectPath = "/dashboard/users/vendors";
                } else if (tokenPayload.permissions.includes("manage_contracts")) {
                    redirectPath = "/dashboard/projects";
                } else if (tokenPayload.permissions.includes("manage_payments")) {
                    redirectPath = "/dashboard/payments";
                } else if (tokenPayload.permissions.includes("manage_disputes")) {
                    redirectPath = "/dashboard/disputes";
                }

                return NextResponse.redirect(new URL(redirectPath, req.url));
            }

            const response = NextResponse.next();
            setCorsHeaders(response);
            return response;
        }

        // For non-super_admin users, check route restrictions
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

    // if (pathname === "/") {
    //     const url = req.nextUrl.clone();
    //     url.pathname = HOME_PAGE;
    //     return NextResponse.redirect(url);
    // }

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
