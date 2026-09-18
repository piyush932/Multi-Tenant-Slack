import nodemailer from 'nodemailer';

import { MAIL_ID, MAIL_PASSWORD } from './serverConfig.js';

const isMailConfigured = Boolean(MAIL_ID && MAIL_PASSWORD);

const transport = isMailConfigured
  ? nodemailer.createTransport({
      service: 'Gmail',
      host: 'smtp.gmail.com',
      port: 465,
      secure: true,
      auth: { user: MAIL_ID, pass: MAIL_PASSWORD },
    })
  : nodemailer.createTransport({ jsonTransport: true });

if (!isMailConfigured) {
  console.warn(
    '[mailConfig] MAIL_ID/MAIL_PASSWORD not set — using jsonTransport ' +
    '(emails are logged, not sent). This is expected for local testing.'
  );
}

export default transport;
