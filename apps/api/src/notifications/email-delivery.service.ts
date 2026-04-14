import { Injectable } from '@nestjs/common';

@Injectable()
export class EmailDeliveryService {
  async sendEmail(input: { to: string; subject: string; text: string }) {
    const apiKey = process.env.RESEND_API_KEY;
    const from = process.env.EMAIL_FROM;

    if (!apiKey || !from) {
      console.log(
        `[email:fallback] to=${input.to} subject=${input.subject} body=${input.text}`,
      );
      return { delivered: false, provider: 'fallback' };
    }

    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from,
        to: [input.to],
        subject: input.subject,
        text: input.text,
      }),
    });

    if (!response.ok) {
      const body = await response.text();
      throw new Error(`Email provider error: ${response.status} ${body}`);
    }

    return { delivered: true, provider: 'resend' };
  }
}
