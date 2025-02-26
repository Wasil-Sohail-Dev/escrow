import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { Admin } from "@/models/AdminSchema";
import dbConnect from "@/lib/dbConnect";
import { z } from "zod";

// Validation schema for admin signup
const adminSignupSchema = z.object({
    firstName: z.string().min(2, "First name must be at least 2 characters"),
    lastName: z.string().min(2, "Last name must be at least 2 characters"),
    userName: z.string().min(3, "Username must be at least 3 characters"),
    email: z.string().email("Invalid email address"),
    password: z.string().min(8, "Password must be at least 8 characters")
        .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
        .regex(/[a-z]/, "Password must contain at least one lowercase letter")
        .regex(/[0-9]/, "Password must contain at least one number")
        .regex(/[^A-Za-z0-9]/, "Password must contain at least one special character"),
    userType: z.enum(["super_admin", "admin", "moderator"]),
    permissions: z.array(z.string()).min(1, "At least one permission is required"),
});

export async function POST(req: Request) {
    console.log("signup");
    try {
        // Check if request is from an authenticated super admin
        // if (!session?.user || !session.user.permissions?.includes("all")) {
        //     return NextResponse.json(
        //         { success: false, error: "Unauthorized. Only super admins can create new admins." },
        //         { status: 401 }
        //     );
        // }

        await dbConnect();
        const body = await req.json();

        // Validate request body
        const validatedData = adminSignupSchema.parse(body);

        // Check if email or username already exists
        const existingAdmin = await Admin.findOne({
            $or: [
                { email: validatedData.email.toLowerCase() },
                { userName: validatedData.userName }
            ]
        });

        if (existingAdmin) {
            return NextResponse.json(
                { 
                    success: false, 
                    error: existingAdmin.email === validatedData.email.toLowerCase() 
                        ? "Email already exists" 
                        : "Username already exists" 
                },
                { status: 400 }
            );
        }

        // Create new admin
        const newAdmin = await Admin.create({
            ...validatedData,
            userStatus: "active",
            email: validatedData.email.toLowerCase()
        });

        // Remove sensitive data before sending response
        const adminResponse = {
            id: newAdmin._id,
            firstName: newAdmin.firstName,
            lastName: newAdmin.lastName,
            userName: newAdmin.userName,
            email: newAdmin.email,
            userType: newAdmin.userType,
            permissions: newAdmin.permissions
        };

        return NextResponse.json({
            success: true,
            message: "Admin created successfully",
            data: adminResponse
        });

    } catch (error) {
        console.error("Admin signup error:", error);
        
        if (error instanceof z.ZodError) {
            return NextResponse.json(
                { success: false, error: error.errors[0].message },
                { status: 400 }
            );
        }

        return NextResponse.json(
            { success: false, error: "Internal server error" },
            { status: 500 }
        );
    }
} 
