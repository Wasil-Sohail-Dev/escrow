import axios from "axios";

export const sendMailCode = async (email: string) => {

    try {
        const response = await axios.post(
            `${process.env.NEXT_PUBLIC_BASE_URL}/api/send-mail-code`,
            { email }
        );
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
