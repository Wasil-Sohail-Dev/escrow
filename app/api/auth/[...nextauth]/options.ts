import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import dbConnect from "@/lib/dbConnect";
import argon2 from "argon2";
import { Customer } from "@/models/Schema";

type User = {
    _id: string;
    email: string;
    username: string;
    password: string;
    userType: string;
    userStatus: string;
    onboardingToken?: string | null;
    tokenExpiresAt?: Date | null;
};

export const authOptions: NextAuthOptions = {
    providers: [
        CredentialsProvider({
            name: "Credentials",
            credentials: {
                email: { label: "Email", type: "text" },
                password: { label: "Password", type: "password" },
                onboardingToken: { label: "Onboarding Token", type: "text" }, // Added onboarding token
            },
            authorize: async (credentials) => {
                if (!credentials) return null;

                const { email, password, onboardingToken } = credentials;

                await dbConnect();
                const user = await Customer.findOne<User>(
                    { email },
                    "email username password userType status onboardingToken tokenExpiresAt"
                );

                if (!user) {
                    console.error(`Authentication failed: User with email ${email} not found.`);
                    return null;
                }

                if (user.userStatus === "adminInactive" || user.userStatus === "userInactive") {
                    console.error(`Authentication failed: User with email ${email} is inactive.`);
                    throw new Error("Your account is inactive. Please contact support.");
                }

                // Handle onboarding token if provided
                if (onboardingToken) {
                    // Check if the onboarding token matches and if it hasn't expired
                    if (
                        user.onboardingToken !== onboardingToken ||
                        user.tokenExpiresAt && new Date() > new Date(user.tokenExpiresAt)
                    ) {
                        console.error(`Authentication failed: Invalid or expired onboarding token for ${email}.`);
                        return null;
                    }

                    // Clear onboarding token after successful login
                    user.onboardingToken = null;
                    user.tokenExpiresAt = null;
                    await (user as any).save();

                    return {
                        id: user._id.toString(),
                        email: user.email,
                        username: user.username,
                        userType: user.userType,
                    };
                }

                // Fallback to regular password authentication if onboarding token is not provided
                const isValidPassword = await argon2.verify(user.password, password);
                if (!isValidPassword) {
                    console.error(`Authentication failed: Invalid password for email ${email}.`);
                    await new Promise((res) => setTimeout(res, 500)); // Add delay to prevent timing attacks
                    return null;
                }

                return {
                    id: user._id.toString(),
                    email: user.email,
                    username: user.username,
                    userType: user.userType,
                };
            },
        }),
    ],
    session: { strategy: "jwt" },
    callbacks: {
        async jwt({ token, user }) {
            if (user) {
                token.id = user.id;
                token.email = user.email;
                token.username = user.username;
                token.userType = user.userType;
            }
            return token;
        },
        async session({ session, token }) {
            session.user = {
                ...session.user,
                id: token.id as string,
                email: token.email as string,
                username: token.username as string,
                userType: token.userType as string,
            };
            return session;
        },
    },

    pages: {
        signIn: "/sign-in",
        error: "/auth-error", // Separate error page
    },
    secret: process.env.NEXTAUTH_SECRET,
};

// Extend types for the user object in the session
declare module "next-auth" {
    interface Session {
        user: {
            id: string;
            email: string;
            username: string;
            userType: string;
        };
    }

    interface User {
        id: string;
        email: string;
        username: string;
        userType: string;
    }

    interface JWT {
        id: string;
        email: string;
        username: string;
        userType: string;
    }
}
