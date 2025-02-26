import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import dbConnect from "@/lib/dbConnect";
import argon2 from "argon2";
import { Customer } from "@/models/CustomerSchema";

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
        GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID!,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
            authorization: {
                params: {
                    prompt: "select_account",
                },
            },
        }),
        CredentialsProvider({
            name: "Credentials",
            credentials: {
                email: { label: "Email", type: "text" },
                password: { label: "Password", type: "password" },
                onboardingToken: { label: "Onboarding Token", type: "text" },
            },
            authorize: async (credentials, req) => {
                if (!credentials) return null;

                const { email, password, onboardingToken } = credentials;

                await dbConnect();
                const user = await Customer.findOne<User>(
                    { email },
                    "email username password userType userStatus onboardingToken tokenExpiresAt"
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
                    if (
                        user.onboardingToken !== onboardingToken ||
                        (user.tokenExpiresAt && new Date() > new Date(user.tokenExpiresAt))
                    ) {
                        console.error(`Authentication failed: Invalid or expired onboarding token for ${email}.`);
                        return null;
                    }

                    user.onboardingToken = null;
                    user.tokenExpiresAt = null;
                    await (user as any).save();

                    return {
                        id: user._id.toString(),
                        email: user.email,
                        username: user.username,
                        userType: user.userType,
                        userStatus: user.userStatus,
                        permissions: [] // Add empty permissions array for client users
                    };
                }

                // Fallback to regular password authentication
                const isValidPassword = await argon2.verify(user.password, password);
                if (!isValidPassword) {
                    console.error(`Authentication failed: Invalid password for email ${email}.`);
                    await new Promise((res) => setTimeout(res, 500));
                    return null;
                }

                return {
                    id: user._id.toString(),
                    email: user.email,
                    username: user.username,
                    userType: user.userType,
                    userStatus: user.userStatus,
                    permissions: [] // Add empty permissions array for client users
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
                token.userStatus = user.userStatus; // Save userStatus in token
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
                userStatus: token.userStatus as string, // Add userStatus to session
            };
            return session;
        },
        async signIn({ user, account }) {
            if (account?.provider === "google" || account?.provider === "facebook") {
                try {
                    await dbConnect();
                    const existingUser = await Customer.findOne({ email: user.email });

                    if (!existingUser) {
                        // Get userType from credentials or default to client

                        // Create new user if doesn't exist
                        const newUser = await Customer.create({
                            email: user.email,
                            username: user.name,
                            userType: "client",
                            userStatus: "verified", // Set to pending for onboarding
                            password: "W@sil@li123", // No password for OAuth users
                        });
                        // Update the user object to include all required fields
                        user.id = newUser._id.toString();
                        user.username = newUser.username;
                        user.userType = newUser.userType;
                        user.userStatus = newUser.userStatus;
                        return true;
                    } else {
                        // Update the user object with existing user data
                        user.id = existingUser._id.toString();
                        user.username = existingUser.username;
                        user.userType = existingUser.userType;
                        user.userStatus = existingUser.userStatus;
                        return true;
                    }
                } catch (error) {
                    console.error("Error in Google sign in:", error);
                    return false;
                }
            }
            return true;
        },
    },
    pages: {
        signIn: "/sign-in",
        error: "/auth-error",
    },
    secret: process.env.NEXTAUTH_SECRET,
};

declare module "next-auth" {
    interface Session {
        user: {
            id: string;
            email: string;
            username: string;
            userType: string;
            userStatus: string; // Include userStatus in session type
        };
    }

    interface User {
        id: string;
        email: string;
        username: string;
        userType: string;
        userStatus: string; // Include userStatus in user type
    }

    interface JWT {
        id: string;
        email: string;
        username: string;
        userType: string;
        userStatus: string; // Include userStatus in JWT type
    }
}