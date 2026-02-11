import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
     host: process.env.SMTP_HOST || 'smtp.ethereal.email',
     port: parseInt(process.env.SMTP_PORT || '587'),
     secure: process.env.SMTP_SECURE === 'true', // true for 465, false for other ports
     auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
     },
});

export const sendEmail = async ({ to, subject, html }) => {
     if (!to || !subject || !html) {
          throw new Error('Missing required email parameters');
     }

     const from = process.env.SMTP_FROM || '"Fermentaa Admin" <admin@fermentaa.com>';

     try {
          const info = await transporter.sendMail({
               from,
               to,
               subject,
               html,
          });

          console.log('Message sent: %s', info.messageId);

          // Preview only available when sending through an Ethereal account
          if (process.env.NODE_ENV !== 'production' && !process.env.SMTP_HOST) {
               console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
          }

          return { success: true, messageId: info.messageId };
     } catch (error) {
          console.error('Error sending email:', error);
          return { success: false, error: error.message };
     }
};
