import { Injectable, Logger } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

const SMTP_USER = process.env.SMTP_USER;
const SMTP_PASS = process.env.SMTP_PASS;
const MAIL_FROM_NAME = process.env.MAIL_FROM_NAME || 'AI Discovery';

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);
  private transporter: nodemailer.Transporter | null = null;

  constructor() {
    if (SMTP_USER && SMTP_PASS) {
      this.transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: { user: SMTP_USER, pass: SMTP_PASS },
      });
    } else {
      this.logger.warn(
        'SMTP_USER / SMTP_PASS are not set — emails will be logged instead of sent. ' +
          'Set them in .env to send real emails via Gmail.',
      );
    }
  }

  async sendWelcomeEmail(to: string, name: string): Promise<void> {
    const subject = 'Welcome to AI Discovery';
    const text = `Hi ${name},\n\nYour AI Discovery account (${to}) has just been created. You can now log in, read the latest AI & tech coverage, and post your own articles or discussions.\n\n— AI Discovery`;
    const html = `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 480px; margin: 0 auto; padding: 32px 24px;">
        <div style="display:inline-flex;align-items:center;gap:8px;margin-bottom:24px;">
          <span style="display:inline-flex;align-items:center;justify-content:center;width:26px;height:26px;border-radius:6px;background:#667eea;color:#fff;font-size:12px;font-weight:800;">AI</span>
          <strong style="font-size:15px;">Discovery</strong>
        </div>
        <h1 style="font-size:22px;margin:0 0 12px;">Welcome, ${this.escapeHtml(name)}</h1>
        <p style="font-size:14px;line-height:1.6;color:#444;">
          Your account has been created with <strong>${this.escapeHtml(to)}</strong>.
          You can now log in to read the latest AI &amp; tech coverage, follow
          categories, and publish your own articles or discussions.
        </p>
        <p style="font-size:14px;line-height:1.6;color:#444;">
          If you didn't create this account, you can safely ignore this email.
        </p>
        <p style="font-size:13px;color:#999;margin-top:32px;">— AI Discovery</p>
      </div>
    `;

    if (!this.transporter) {
      this.logger.log(`[dev] Would send welcome email to ${to}: "${subject}"`);
      return;
    }

    try {
      await this.transporter.sendMail({
        from: `"${MAIL_FROM_NAME}" <${SMTP_USER}>`,
        to,
        subject,
        text,
        html,
      });
      this.logger.log(`Welcome email sent to ${to}`);
    } catch (error) {
      this.logger.error(`Failed to send welcome email to ${to}:`, error);
    }
  }

  private escapeHtml(value: string): string {
    return value
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }
}
