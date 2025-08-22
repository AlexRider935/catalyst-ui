import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

export async function POST(request) {
    try {
        const { config, testEmail } = await request.json();
        if (!config || !testEmail) {
            return NextResponse.json({ error: 'Configuration and test email are required.' }, { status: 400 });
        }

        let transporter;
        if (config.authMethod === 'api') {
            transporter = nodemailer.createTransport({
                host: "smtp.sendgrid.net", port: 587, secure: false,
                auth: { user: "apikey", pass: config.apiKey },
            });
        } else {
            transporter = nodemailer.createTransport({
                host: config.smtpServer, port: parseInt(config.smtpPort, 10), secure: config.smtpPort === '465',
                auth: { user: config.smtpUser, pass: config.smtpPass },
            });
        }

        await transporter.sendMail({
            from: `"${config.senderName}" <${config.senderEmail}>`,
            to: testEmail,
            subject: "Test Email from The Catalyst Platform",
            html: "<b>This is a test email to confirm your integration settings are correct.</b>",
        });

        return NextResponse.json({ message: `Test email sent successfully to ${testEmail}!` });

    } catch (error) {
        console.error('Dispatch Test API Error:', error);
        return NextResponse.json({ error: 'Failed to dispatch test email.', details: error.message }, { status: 500 });
    }
}