import { mailerConfig } from "./mailer-config.js";
import nodemailer from "nodemailer";

export const sendEmail = async ({ to, subject, html }) => {
  const transporter = nodemailer.createTransport(mailerConfig);
  return transporter.sendMail({
    from: '"Your boss" <admin@mail.com>', // sender address
    to, // list of receivers
    subject, // Subject line
    html, // html body
  });
};
