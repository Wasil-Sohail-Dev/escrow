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
