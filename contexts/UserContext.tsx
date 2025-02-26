"use client";

import { createContext, useContext, useEffect, useState } from "react";

export interface VerificationData {
  isKycApproved: boolean;
  kycDescription?: string;
  isBlocked: boolean;
  blockReason?: string;
  verifiedBy: {
    firstName: string;
    lastName: string;
    email: string;
  };
  verifiedAt: string;
}

export interface User {
  _id: string;
  email: string;
  profileImage: string | null;
  userType: string;
  userStatus: string;
  companyAddress: string;
  companyName: string;
  firstName: string;
  lastName: string;
  phone: string;
  userName: string;
  verificationStatus: string;
  verification?: VerificationData;
  isButtonDisabled: boolean;
}

interface UserContextType {
  user: User | null;
  loading: boolean;
  refreshUser: () => Promise<void>;
}

const UserContext = createContext<UserContextType>({
  user: null,
  loading: true,
  refreshUser: async () => {},
});

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchUser = async () => {
    try {
      // Fetch user profile
      const userResponse = await fetch("/api/get-user-profile", {
        cache: "no-store",
        headers: {
          "Cache-Control": "no-cache",
        },
      });
      const userData = await userResponse.json();

      if (userData.user) {
        // Fetch verification data if user exists
        const verificationResponse = await fetch(
          `/api/get-user-verification?customerId=${userData.user._id}`,
          {
            cache: "no-store",
            headers: {
              "Cache-Control": "no-cache",
            },
          }
        );
        const verificationData = await verificationResponse.json();
        console.log(verificationData, "verificationData");

        const isButtonDisabled = verificationData?.success
          ? verificationData.data.isBlocked ||
            !verificationData.data.isKycApproved
          : false;

        // Combine user and verification data
        setUser({
          ...userData.user,
          verification: verificationData.success
            ? verificationData.data
            : undefined,
          isButtonDisabled: isButtonDisabled,
        });
      } else {
        setUser(null);
      }
    } catch (error) {
      console.error("Error fetching user:", error);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const refreshUser = async () => {
    setLoading(true);
    await fetchUser();
    setLoading(false);
  };

  useEffect(() => {
    fetchUser();
  }, []);
  console.log(user, "useruseruser");

  return (
    <UserContext.Provider value={{ user, loading, refreshUser }}>
      {children}
    </UserContext.Provider>
  );
}

export const useUser = () => useContext(UserContext);
