import { getToken } from "next-auth/jwt";
import { NextRequest, NextResponse } from "next/server";

export async function middleware(req: NextRequest) {
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
    const { pathname } = req.nextUrl;

    // Skip middleware for the Stripe webhook route
    if (pathname === "/api/escrow-stripe-webhook") {
        console.log("Skipping middleware for webhook.");
        return NextResponse.next();
    }

    const isAuthPage =
        pathname === "/sign-in" ||
        pathname === "/user-register" ||
        pathname === "/select-usertype" ||
        pathname === "/mail-verify" ||
        pathname === "/on-boarding" ||
        pathname === "/reset-password" ||
        pathname === "/forgot-password" ||
        pathname === "/verification-mail";

    const isOnboardingPage = pathname === "/on-boarding";

    // return NextResponse.next();

    // Handle CORS preflight (OPTIONS method)
    if (req.method === "OPTIONS") {
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

    // Skip API routes
    if (pathname.startsWith("/api/auth")) {
        return NextResponse.next();
    }

    // If user is not authenticated and trying to access protected routes
    if (!token && !isAuthPage) {
        const url = req.nextUrl.clone();
        url.pathname = "/sign-in";
        return NextResponse.redirect(url);
    }

    // If user is authenticated
    if (token) {
        // Check if user needs onboarding (based on userStatus in token)
        const needsOnboarding = token.userStatus === "verified" || !token.userStatus;

        // If needs onboarding and not on onboarding page, redirect to onboarding
        // if(token.userStatus === "pendingVerification" && !isAuthPage){
        //     const url = req.nextUrl.clone();
        //     url.pathname = "/mail-verify";
        //     return NextResponse.redirect(url);
        // }

        if (token.userStatus === "active" && pathname === "/on-boarding") {
            const url = req.nextUrl.clone();
            url.pathname = "/home";
            return NextResponse.redirect(url);
        }
        if (needsOnboarding && !isOnboardingPage) {
            const url = req.nextUrl.clone();
            url.pathname = "/on-boarding";

            const tokenData = {
                email: token.email,
                userType: token.userType,
                userStatus: token.userStatus,
            };

            const response = NextResponse.redirect(url);

            // Set token data in a cookie that can be read by the client
            response.cookies.set('TpAuthToken', JSON.stringify(tokenData), {
                httpOnly: false, // Allow client-side access
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'lax',
                maxAge: 60 * 60 // 1 hour
            });

            return response;
        }


        // If user is verified and trying to access auth pages or onboarding
        if (!needsOnboarding && (isAuthPage || isOnboardingPage)) {
            const url = req.nextUrl.clone();
            url.pathname = "/home";
            return NextResponse.redirect(url);
        }
    }

    if (pathname === "/") {
        const url = req.nextUrl.clone();
        url.pathname = "/home";
        return NextResponse.redirect(url);
    }

    if (token?.userType==="vendor") {
    if (pathname === "/create-contract") {
        const url = req.nextUrl.clone();
        url.pathname = "/";
        return NextResponse.redirect(url);
    }
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
    matcher: ["/((?!api|api/escrow-stripe-webhook|_next/static|favicon.ico|assets/).*)"],
};
