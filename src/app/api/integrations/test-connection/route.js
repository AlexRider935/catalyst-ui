import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

export async function POST(request) {
    try {
        const { config } = await request.json();
        if (!config) {
            return NextResponse.json({ error: 'Configuration is required.' }, { status: 400 });
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

        await transporter.verify();

        return NextResponse.json({ message: 'Credentials verified successfully.' });

    } catch (error) {
        console.error('Connection Test API Error:', error);
        return NextResponse.json({ error: 'Connection failed.', details: error.message }, { status: 500 });
    }
}