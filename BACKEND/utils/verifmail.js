import nodemailer from "nodemailer";

const verifyEmail = async (email, link) => {
    const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
            user: process.env.GMAIL_USER,
            pass: process.env.GMAIL_PASS,
        },
    });

    const mailOptions = {
        from: process.env.GMAIL_USER,
        to: email,
        subject: "Verify your email",
        html: `
  <div style="font-family: Arial, sans-serif; background-color: #f6f6f6; padding: 20px;">
    <div style="max-width: 600px; margin: auto; background-color: #ffffff; border-radius: 8px; padding: 30px; box-shadow: 0 4px 12px rgba(0,0,0,0.05);">
      <h2 style="color: #333333;">Welcome to Dr.Sathi 👋</h2>
      <p style="font-size: 16px; color: #555555;">You're almost there! Please verify your email address to complete your registration.</p>
      <div style="text-align: center; margin: 30px 0;">
        <a href="${link}" style="background-color: #4CAF50; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-size: 16px;">Verify Email</a>
      </div>
      <p style="font-size: 14px; color: #999999;">If you didn’t request this, you can safely ignore this email.</p>
      <p style="font-size: 14px; color: #999999;">— The Dr.Sathi Team</p>
    </div>
  </div>
`,
    };

    return transporter.sendMail(mailOptions);
};

export default verifyEmail;
