import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import { Admin } from "@/models/AdminSchema";
import argon2 from "argon2";
import jwt from "jsonwebtoken";

export async function POST(req: Request) {
    try {
        await dbConnect();
        const { email, password } = await req.json();

        // Find admin
        const admin = await Admin.findOne({ email });
        if (!admin) {
            return NextResponse.json(
                { success: false, error: "Invalid credentials" },
                { status: 401 }
            );
        }

        // Verify password
        const isValidPassword = await argon2.verify(admin.password, password);
        if (!isValidPassword) {
            return NextResponse.json(
                { success: false, error: "Invalid credentials" },
                { status: 401 }
            );
        }

        // Check if admin is active
        if (admin.userStatus !== "active") {
            return NextResponse.json(
                { success: false, error: "Your account is inactive. Please contact super admin." },
                { status: 403 }
            );
        }

        // Create session token with all necessary information
        const sessionToken = jwt.sign(
            {
                id: admin._id,
                email: admin.email,
                firstName: admin.firstName,
                lastName: admin.lastName,
                userType: admin.userType,
                userStatus: admin.userStatus,
                permissions: admin.permissions
            },
            process.env.NEXTAUTH_SECRET!,
            { expiresIn: "1d" }
        );

        // Get the domain from the request
        const domain = req.headers.get('host') || '';
        const isLocalhost = domain.includes('localhost') || domain.includes('209.105.243.7');

        // Set session cookie
        const response = NextResponse.json({
            success: true,
            user: {
                id: admin._id,
                email: admin.email,
                firstName: admin.firstName,
                lastName: admin.lastName,
                userType: admin.userType,
                userStatus: admin.userStatus,
                permissions: admin.permissions
            }
        });

        // Configure cookie options based on environment
        const cookieOptions = {
            httpOnly: true,
            secure: !isLocalhost, // Only use HTTPS in production
            sameSite: "lax" as const,
            path: '/',
            domain: isLocalhost ? undefined : domain, // Set domain in production
            maxAge: 30 * 24 * 60 * 60 // 30 days
        };

        // Set the cookie with appropriate options
        response.cookies.set('next-auth.session-token', sessionToken, cookieOptions);

        // Update last login
        await Admin.findByIdAndUpdate(admin._id, {
            lastLogin: new Date()
        });

        return response;

    } catch (error) {
        console.error("Admin login error:", error);
        return NextResponse.json(
            { success: false, error: "Internal server error" },
            { status: 500 }
        );
    }
} 
