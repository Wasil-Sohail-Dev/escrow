import { NextResponse } from "next/server";

export async function POST() {
    try {
        const response = NextResponse.json({
            success: true,
            message: "Logged out successfully"
        });

        // Clear the session cookie
        response.cookies.set('next-auth.session-token', '', {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            path: '/',
            maxAge: 0 // This will make the cookie expire immediately
        });

        return response;
    } catch (error) {
        console.error("Logout error:", error);
        return NextResponse.json(
            { success: false, error: "Internal server error" },
            { status: 500 }
        );
    }
} 