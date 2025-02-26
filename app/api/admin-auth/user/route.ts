import { NextResponse } from "next/server";
import { Admin } from "@/models/AdminSchema";
import dbConnect from "@/lib/dbConnect";
import jwt from "jsonwebtoken";

export async function GET(req: Request) {
    try {
        // Get the session token from cookies
        const cookieHeader = req.headers.get('cookie');
        const sessionToken = cookieHeader?.split(';')
            .find(c => c.trim().startsWith('next-auth.session-token='))
            ?.split('=')?.[1];

        if (!sessionToken) {
            return NextResponse.json(
                { success: false, error: "No session found" },
                { status: 401 }
            );
        }

        // Verify the token
        const decoded = jwt.verify(sessionToken, process.env.NEXTAUTH_SECRET!) as {
            id: string;
            email: string;
            firstName: string;
            lastName: string;
            username: string;
            userType: string;
            userStatus: string;
            permissions: string[];
        };

        // Get fresh user data from database
        await dbConnect();
        const admin = await Admin.findById(decoded.id).select('-password');

        if (!admin) {
            return NextResponse.json(
                { success: false, error: "User not found" },
                { status: 404 }
            );
        }

        return NextResponse.json({
            success: true,
            user: {
                id: admin._id,
                email: admin.email,
                firstName: admin.firstName,
                lastName: admin.lastName,
                username: admin.userName,
                userType: admin.userType,
                userStatus: admin.userStatus,
                permissions: admin.permissions
            }
        });

    } catch (error) {
        console.error("Get user error:", error);
        return NextResponse.json(
            { success: false, error: "Invalid session" },
            { status: 401 }
        );
    }
} 