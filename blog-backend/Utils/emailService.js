import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

class EmailService {
  constructor() {
    this.transporter = nodemailer.createTransport({
      service: "gmail",
      host: "smtp.gmail.com",
      port: 587,
      secure: false,
      auth: {
        user: process.env.EMAIL_ADDRESS,
        pass: process.env.EMAIL_PASSWORD,
      },
      tls: {
        rejectUnauthorized: false,
      },
      connectionTimeout: 10000,
      greetingTimeout: 5000,
      socketTimeout: 10000,
    });
    this.verifyConnecton();
  }

  async sendEmail(to, subject, html) {
    try {
      // validate inputs
      if (!to || !subject || !html) {
        throw new Error("Missing required email parameters");
      }
      // validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(to)) {
        throw new Error("Invalid email format");
      }

      const mailOptions = {
        from: `"Blog App" <${process.env.EMAIL_ADDRESS}>`,
        to,
        subject,
        html,
      };
      const info = await this.transporter.sendMail(mailOptions);
      console.log("Email sent successfully:", info.messageId);
      return info;
    } catch (error) {
      console.error("Error sending email", error);
      throw new Error("Failed to send email");
    }
  }

  async verifyConnecton() {
    try {
      await this.transporter.verify();
      console.log("Email server is ready");
      return true;
    } catch (error) {
      console.error("Email server connection failed", error.message);
      return false;
    }
  }
}

export default new EmailService();
