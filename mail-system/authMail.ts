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

export const sendForgotPasswordEmail = async (email: string, resetLink: string): Promise<void> => {
  console.log("Sending forgot-password email to:", email);

  try {
    await transporter.sendMail({
      from: `"LTS" <${process.env.SMTP_USER}>`,
      to: email,
      subject: "Reset Your Password",
      text: `We received a request to reset your password. If you did not make this request, please ignore this email. 
      
        To reset your password, click the link below or paste it into your browser:
        ${resetLink}

        This link will expire in 15 minutes.

        If you need further assistance, contact our support team.

        Best regards,`,
      html: `
        <p>We received a request to reset your password. If you did not make this request, you can safely ignore this email.</p>
        <p>To reset your password, click the button below or copy and paste the link into your browser:</p>
        <p><a href="${resetLink}" style="color: white; background: #007bff; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">Reset Password</a></p>
        <p>Or, copy this link into your browser:</p>
        <p>${resetLink}</p>
        <p>This link will expire in 15 minutes.</p>
        <p>If you need further assistance, contact our support team.</p>
        <p>Best regards,</p>
      `,
    });

    console.log("Forgot-password email sent successfully to:", email);
  } catch (error) {
    console.error("Error sending forgot-password email:", error);
    throw error; // Propagate the error to the calling function
  }
};


export const verifyMail = async (email: string, validationCode: number): Promise<void> => {
  console.log("Sending verification mail to:", email);

  try {
    await transporter.sendMail({
      from: `"Your App Name" <${process.env.SMTP_USER}>`,
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
