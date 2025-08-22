// src/app/api/integrations/[id]/test/route.js

import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import nodemailer from 'nodemailer';

const decryptSecret = (encrypted) => Buffer.from(encrypted, 'base64').toString('utf8');

export async function POST(request, context) {
    // ✅ Await params properly
    const { id } = await context.params;

    // Always try/catch JSON parsing, avoids "Unexpected end of JSON input"
    let body;
    try {
        body = await request.json();
    } catch {
        return NextResponse.json(
            { error: 'Invalid or missing JSON body' },
            { status: 400 }
        );
    }

    const { testEmail } = body;

    if (!id || !testEmail) {
        return NextResponse.json(
            { error: 'Integration ID and test email are required.' },
            { status: 400 }
        );
    }

    try {
        const result = await db.query('SELECT config FROM integrations WHERE id = $1', [id]);
        if (result.rows.length === 0) {
            return NextResponse.json({ error: 'Integration not found.' }, { status: 404 });
        }

        const config = result.rows[0].config;

        // Decrypt secrets
        if (config.apiKey) config.apiKey = decryptSecret(config.apiKey);
        if (config.smtpPass) config.smtpPass = decryptSecret(config.smtpPass);

        let transporter;
        if (config.authMethod === 'api') {
            transporter = nodemailer.createTransport({
                host: "smtp.sendgrid.net",
                port: 587,
                secure: false,
                auth: { user: "apikey", pass: config.apiKey },
            });
        } else if (config.authMethod === 'smtp') {
            transporter = nodemailer.createTransport({
                host: config.smtpServer,
                port: parseInt(config.smtpPort, 10),
                secure: config.smtpPort === '465',
                auth: { user: config.smtpUser, pass: config.smtpPass },
            });
        } else {
            throw new Error("Unsupported authentication method in saved config.");
        }

        await transporter.sendMail({
            from: `"${config.senderName}" <${config.senderEmail}>`,
            to: testEmail,
            subject: "Test Email from The Catalyst Platform",
            html: `<b>This is a test of the saved integration:</b><br/>Name: ${config.name}<br/>ID: ${id}`,
        });

        return NextResponse.json({
            message: `Test email successfully sent via '${config.name}'!`,
        });
    } catch (error) {
        console.error(`API Test Error for integration ${id}:`, error);
        return NextResponse.json(
            { error: 'Failed to send test email.', details: error.message },
            { status: 500 }
        );
    }
}