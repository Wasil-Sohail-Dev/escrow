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

export const sendForgotPasswordEmail = async (
  email: string,
  resetCode: string,
  resetLink: string
): Promise<void> => {
  console.log("Sending forgot-password email to:", email);

  try {
    await transporter.sendMail({
      from: `"Support Team" <${process.env.SMTP_USER}>`,
      to: email,
      subject: "Reset Your Password",
      text: `We received a request to reset your password. 
      
      Your 6-digit verification code: ${resetCode}
              
      To reset your password using the web, click the link below:
      ${resetLink}

      This code and link will expire in 1 Day.

      If you did not request this reset, please ignore this email.

      Best regards,`,
      html: `
        <p>We received a request to reset your password. If you did not make this request, you can safely ignore this email.</p>
        <h2 style="text-align: center;">Your 6-digit verification code:</h2>
        <h1 style="text-align: center; background: #f4f4f4; padding: 10px; border-radius: 5px; display: inline-block;">${resetCode}</h1>
        <p>Or, reset your password using the link below:</p>
        <p><a href="${resetLink}" style="color: white; background: #007bff; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">Reset Password</a></p>
        <p>Or, copy this link into your browser:</p>
        <p>${resetLink}</p>
        <p>This code and link will expire in 15 minutes.</p>
        <p>If you need further assistance, contact our support team.</p>
        <p>Best regards,</p>
      `,
    });

    console.log("Forgot-password email sent successfully to:", email);
  } catch (error) {
    console.error("Error sending forgot-password email:", error);
    throw error;
  }
};

export const verifyMail = async (email: string, validationCode: number): Promise<void> => {
  console.log("Sending verification mail to:", email);

  const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT),
      secure: process.env.SMTP_SECURE === "true",
      auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
      },
  });

  const emailHTML = `
      <div style="font-family: Arial, sans-serif; max-width: 500px; margin: auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px; background-color: #f9f9f9;">
          <h2 style="color: #333; text-align: center;">Third Party Escrow</h2>
          <p style="font-size: 16px; color: #555;">Dear User,</p>
          <p style="font-size: 16px; color: #555;">Your verification code is:</p>
          <div style="font-size: 22px; font-weight: bold; text-align: center; padding: 10px; background-color: #26B893; color: white; border-radius: 5px;">
              ${validationCode}
          </div>
          <p style="font-size: 14px; color: #777;">Please enter this code to verify your email address.</p>
          <p style="font-size: 14px; color: #777;">If you did not request this, please ignore this email.</p>
          <p style="font-size: 14px; color: #777;">Thank you,<br/>Third Party Escrow Team</p>
      </div>
  `;

  try {
      await transporter.sendMail({
          from: `"Third Party Escrow" <${process.env.SMTP_USER}>`,
          to: email,
          subject: "Verify Your Email - Third Party Escrow",
          text: `Your verification code is: ${validationCode}`,
          html: emailHTML,
      });

      console.log("Verification email sent successfully to:", email);
  } catch (error) {
      console.error("Error sending verification email:", error);
      throw error; // Propagate the error to the calling function
  }
};
