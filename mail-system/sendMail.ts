import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST, // SMTP server
    port: 465, // or 587 for TLS
    secure: true, // true for port 465, false for port 587
    auth: {
        user: process.env.SMTP_USER, // SMTP user
        pass: process.env.SMTP_PASS, // SMTP password
    },
});

export const verifyMail = async (email: string, validationCode: number): Promise<void> => {
    console.log("Sending verification mail to:", email);

    try {
        await transporter.sendMail({
            from: `"Third Party App" <${process.env.SMTP_USER}>`,
            to: email,
            subject: "Your Verification Code",
            text: `Your verification code is: ${validationCode}`,
            html: `<p>Your verification code is: <strong>${validationCode}</strong></p>`,
        });
        console.log("Verification email sent successfully to:", email);
    } catch (error) {
        console.error("Error sending verification email:", error);
        throw error; // Propagate the error to the calling function
    }
};

export const sendContractInvite = async (contractId: string, vendorEmail: string, clientEmail: string): Promise<void> => {
    console.log("Sending contract invite to vendor:", vendorEmail);

    try {
        const contractLink = `${process.env.NEXT_PUBLIC_BASE_URL}/invite/${contractId}`;

        await transporter.sendMail({
            from: `"Third Party App" <${process.env.SMTP_USER}>`,
            to: vendorEmail,
            subject: "You Have a New Contract Invitation",
            text: `Hello,

                You have been invited by ${clientEmail} to review and accept a contract. Please click the link below to view the contract:

                ${contractLink}

                Best regards,
                Your App Team`,
            html: `<p>Hello,</p>
                   <p>You have been invited by <strong>${clientEmail}</strong> to review and accept a contract. Please click the link below to view the contract:</p>
                   <p><a href="${contractLink}">${contractLink}</a></p>
                   <p>Best regards,<br>Your App Team</p>`,
        });

        console.log("Contract invite sent successfully to vendor:", vendorEmail);
    } catch (error) {
        console.error("Error sending contract invite:", error);
        throw error; // Propagate the error to the calling function
    }
};

export const sendContactUsMail = async (
    name: string,
    email: string,
    message: string,
    phone?: string
): Promise<void> => {
    console.log("Sending contact us email from:", email);

    try {
        // Email content
        const subject = "New Contact Us Message";
        const adminEmail = process.env.ADMIN_EMAIL; // Replace this with your admin email
        const contactDetails = `
            Hello,

            You have received a new message from the Contact Us form:

            Name: ${name}
            Email: ${email}
            Phone: ${phone || "N/A"}

            Message:
            ${message}

            Best regards,
            Your App Team
            `;

        const htmlContent = `
            <p>Hello,</p>
            <p>You have received a new message from the <strong>Contact Us</strong> form:</p>
            <ul>
            <li><strong>Name:</strong> ${name}</li>
            <li><strong>Email:</strong> ${email}</li>
            <li><strong>Phone:</strong> ${phone || "N/A"}</li>
            </ul>
            <p><strong>Message:</strong></p>
            <p>${message}</p>
            <p>Best regards,<br>Your App Team</p>
            `;

        // Send the email using nodemailer
        await transporter.sendMail({
            from: `"Your App" <${process.env.SMTP_USER}>`, // Replace with your email
            to: adminEmail, // Admin email where the contact messages will be sent
            subject: subject,
            text: contactDetails,
            html: htmlContent,
        });

        console.log("Contact us email sent successfully from:", email);
    } catch (error) {
        console.error("Error sending contact us email:", error);
        throw error; // Propagate the error to the calling function
    }
};
