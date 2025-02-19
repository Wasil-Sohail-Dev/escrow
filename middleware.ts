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
];

const MAIL_VERIFY_PAGE = "/mail-verify";
const ONBOARDING_PAGE = "/on-boarding";
const HOME_PAGE = "/home";

// ✅ Function to verify JWT using jose
async function verifyToken(token: string) {
    try {
        const secret = new TextEncoder().encode(process.env.NEXTAUTH_SECRET);
        const { payload } = await jwtVerify(token, secret);
        return payload;
    } catch (error: any) {
        console.error("JWT Verification Error:", error.message);
        return null;
    }
}

export async function middleware(req: NextRequest) {
    const { pathname } = req.nextUrl;

    if (pathname === "/api/escrow-stripe-webhook") {
        console.log("Skipping middleware for webhook.");
        return NextResponse.next();
    }

    if (req.method === "OPTIONS") {
        const response = new NextResponse(null, { status: 204 });
        setCorsHeaders(response);
        return response;
    }

    const webToken = await getToken({ req, secret: process.env.NEXTAUTH_SECRET! });

    const authHeader = req.headers.get("Authorization");
    console.log("Raw Authorization Header:", authHeader);
    const mobileToken = authHeader && authHeader.startsWith("Bearer ")
        ? authHeader.split(" ")[1]
        : null;

    console.log("webToken", webToken);
    console.log("mobileToken", mobileToken);

    let tokenPayload: any = null;
    if (mobileToken) {
        tokenPayload = await verifyToken(mobileToken);
        if (!tokenPayload) {
            return NextResponse.json({ message: "Invalid or expired token." }, { status: 403 });
        }
    }

    console.log("tokenPayload", tokenPayload);
    const token = webToken || tokenPayload;
    console.log("Token", token);

    const isPublicPage = PUBLIC_ROUTES.includes(pathname);
    const isPublicApiRoute = PUBLIC_API_ROUTES.some(route => pathname.startsWith(route));

    if (isPublicApiRoute) {
        return NextResponse.next();
    }

    if (!token && !isPublicPage) {
        if (pathname.startsWith("/api")) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        } else {
            const url = req.nextUrl.clone();
            url.pathname = "/sign-in";
            return NextResponse.redirect(url);
        }
    }

    if (token) {
        const userStatus = token.userStatus;

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

    if (pathname === "/") {
        const url = req.nextUrl.clone();
        url.pathname = HOME_PAGE;
        return NextResponse.redirect(url);
    }

    if (token?.userType === "vendor" && pathname === "/create-contract") {
        const url = req.nextUrl.clone();
        url.pathname = "/";
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
