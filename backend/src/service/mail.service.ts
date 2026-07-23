import axios from "axios";
import { env } from "../config/env.js";

export class MailService {
  async sendMail(
    to: string,
    name: string,
    subject: string,
    html: string
  ) {
    const response = await axios.post(
      "https://api.brevo.com/v3/smtp/email",
      {
        sender: {
          name: "Shruti",
          email: env.MAIL_FROM,
        },
        to: [
          {
            email: to,
            name,
          },
        ],
        subject,
        htmlContent: html,
      },
      {
        headers: {
          "api-key": env.BREVO_API_KEY,
          "Content-Type": "application/json",
          Accept: "application/json",
        },
      }
    );

    return response.data;
  }
}