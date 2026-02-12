import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
     host: 'smtp.gmail.com',
     port: 465,
     secure: true,
     auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS, // Should be a Google App Password
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

          ('Message sent: %s', info.messageId);

          // Preview only available when sending through an Ethereal account
          if (process.env.NODE_ENV !== 'production' && !process.env.SMTP_HOST) {
               ('Preview URL: %s', nodemailer.getTestMessageUrl(info));
          }

          return { success: true, messageId: info.messageId };
     } catch (error) {
          console.error('Error sending email:', error);
          return { success: false, error: error.message };
     }
};
