import { User } from "@/contexts/UserContext";
import Image from "next/image";
import Link from "next/link";
import React from "react";

const BlockedAlert = ({ user, userLoading }: { user: User | null, userLoading: boolean }) => {
  console.log(user, "userrr");

  // Determine alert states
  const isBlocked = user?.verification?.isBlocked;
  const isKycNotApproved = !user?.verification?.isKycApproved;
  const kycDescription = user?.verification?.kycDescription;
  const showAlert = isBlocked || isKycNotApproved;

  if (!showAlert||userLoading) return null;

  return (
    <div className="space-y-2 mb-4">
      {/* KYC Alert */}
      {isKycNotApproved && user !== null && (
        <div
          className="bg-yellow-50 dark:bg-yellow-900/20 py-4 px-6 flex items-center gap-6 rounded-lg
          lg:flex-row md:flex-row max-md:text-center
          lg:px-6 md:px-5 max-md:px-4"
        >
          <Image
            src="/assets/warning.svg"
            alt="warning"
            width={28}
            height={28}
          />
          <div className="flex-1">
            <p className="lg:text-body-normal md:text-base-regular max-md:text-small-regular text-yellow-800 dark:text-yellow-200">
              Your account requires identity verification (KYC).{" "}
              {kycDescription ? (
                <span className="block mt-1 text-sm font-medium">
                  Reason: {kycDescription}
                </span>
              ) : (
                <>
                  <Link
                    href="/settings"
                    className="text-yellow-600 dark:text-yellow-400 font-medium hover:underline"
                  >
                    Complete verification
                  </Link>{" "}
                  to access all features.
                </>
              )}
            </p>
          </div>
        </div>
      )}

      {/* Blocked Alert */}
      {(isBlocked || user === null) && (
        <div
          className="bg-red-50 dark:bg-red-900/20 py-4 px-6 flex items-center gap-6 rounded-lg
          lg:flex-row md:flex-row max-md:text-center
          lg:px-6 md:px-5 max-md:px-4"
        >
          <Image
            src="/assets/warning.svg"
            alt="warning"
            width={28}
            height={28}
          />
          <div className="flex-1">
            <p className="lg:text-body-normal md:text-base-regular max-md:text-small-regular text-red-800 dark:text-red-200">
              Your account has been blocked.{" "}
              {user?.verification?.blockReason ? (
                <span>Reason: {user?.verification?.blockReason}</span>
              ) : (
                <span>Please contact support for assistance.</span>
              )}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default BlockedAlert;
