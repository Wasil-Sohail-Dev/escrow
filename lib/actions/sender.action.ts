import axios from "axios";

export const sendNotification = async ({
    receiverId,
    title,
    message,
    type,
    severity = "info",
    link,
    meta,
    senderId, // Optional sender
    category,
    expiresAt,
    status,
}: {
    receiverId: string;
    title: string;
    message: string;
    type: "system" | "user" | "payment" | "alert";
    severity?: "info" | "success" | "warning" | "error";
    link?: string;
    meta?: Record<string, any>;
    senderId?: string;
    category?: string;
    expiresAt?: string; // Date in ISO format
    status?: "unread" | "read" | "dismissed";
}) => {
    try {
        // Prepare the request payload dynamically, removing undefined values
        const payload: Record<string, any> = {
            receiverId,
            title,
            message,
            type,
            severity,
        };

        if (link) payload.link = link;
        if (meta && Object.keys(meta).length > 0) payload.meta = meta;
        if (senderId) payload.senderId = senderId;
        if (category) payload.category = category;
        if (expiresAt) payload.expiresAt = expiresAt;
        if (status) payload.status = status;

        const apiUrl = process.env.NEXT_PUBLIC_BASE_URL
            ? `${process.env.NEXT_PUBLIC_BASE_URL}/api/create-notification`
            : "/api/create-notification";

        const response = await axios.post(apiUrl, payload);

        return response.data;
    } catch (error: any) {
        console.error("Error sending notification:", error);
        return {
            error: true,
            message: error.response?.data?.error || "Failed to send notification.",
        };
    }
};
