import axios from "axios";

export const sendNotification = async (fcmToken: string, title: string, body: string) => {

    try {
        const response = await axios.post(
            `${process.env.NEXT_PUBLIC_BASE_URL}/api/send-notification`,
            { fcmToken, title, body }
        );
        console.log("Notification sent successfully:", response.data);
        return response.data; // Return the response data


    } catch (error: any) {
        // Return an error object instead of throwing
        return {
            error: true,
            message:
                error.response?.data?.error || "Failed to send verification email.",
        };
    }
};
