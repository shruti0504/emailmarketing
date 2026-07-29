import axios from "axios";
import { env } from "../config/env.js";

export interface EmailAttachment {
  name: string;
  url?: string;
  content?: string;
}

export class MailService {
  async sendMail(
    to: string,
    name: string,
    subject: string,
    html: string,
    attachment?: EmailAttachment
  ) {
    const payload: any = {
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
    };

    if (attachment && attachment.name && (attachment.url || attachment.content)) {
      payload.attachment = [
        attachment.url
          ? { url: attachment.url, name: attachment.name }
          : { content: attachment.content, name: attachment.name },
      ];
    }

    const response = await axios.post(
      "https://api.brevo.com/v3/smtp/email",
      payload,
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