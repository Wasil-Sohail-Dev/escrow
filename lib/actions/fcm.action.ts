import axios from "axios";

export const fcmRegister = async (userId: string, fcmToken: string, deviceType: string) => {

    try {
        const response = await axios.post(
            `${process.env.NEXT_PUBLIC_BASE_URL}/api/fcm-register`,
            {
                userId,
                fcmToken,
                deviceType,
            }
        );
        return response.data; // Return the response data
    } catch (error: any) {
        // Return an error object instead of throwing
        return {
            error: true,
            message:
                error.response?.data?.error || "Failed to Register FCM Token",
        };
    }
};
