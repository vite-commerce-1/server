import { mailerConfig } from "./mailer-config.js";
import nodemailer from "nodemailer";

export const sendEmail = async ({ to, subject, html }) => {
  const transporter = nodemailer.createTransport(mailerConfig);
  return transporter.sendMail({
    from: '"Vite Ecommerce" <muhamadkopal32@gmail.com>',
    to,
    subject,
    html,
  });
};
