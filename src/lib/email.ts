
'use server';

import nodemailer from 'nodemailer';

const emailUser = process.env.EMAIL_USER;
const emailPass = process.env.EMAIL_PASS;

if (!emailUser || !emailPass) {
    console.warn("Email credentials are not set in environment variables. Email sending will be disabled.");
}

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: emailUser,
        pass: emailPass,
    },
});

interface MailOptions {
    to: string;
    subject: string;
    html: string;
}

export const sendMail = async ({ to, subject, html }: MailOptions) => {
    if (!emailUser || !emailPass) {
        throw new Error("Email service is not configured on the server.");
    }
    
    try {
        await transporter.sendMail({
            from: `"The Brand Cart" <${emailUser}>`,
            to,
            subject,
            html,
        });
    } catch (error) {
        console.error("Could not send email:", error);
        throw new Error("An error occurred while trying to send the email.");
    }
};
