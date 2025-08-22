import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

/**
 * Silas: This endpoint validates NEW, UNSAVED configurations from the setup page.
 * It performs lightweight checks to confirm credentials or reachability.
 */
export async function POST(request) {
    const body = await request.json();
    const { type, config } = body;

    if (!type || !config) {
        return NextResponse.json({ error: 'Integration type and config are required.' }, { status: 400 });
    }

    switch (type) {
        case 'webhook':
            try {
                const { targetUrl } = config;
                if (!targetUrl) throw new Error("Target URL is missing.");

                // A connection test should be a lightweight check, not a full POST.
                // A HEAD request is ideal as it just checks for the server's response headers.
                const response = await fetch(targetUrl, { method: 'HEAD' });

                // Any response, even an error like 405 (Method Not Allowed), proves the server is reachable.
                // We only fail on network errors (caught by the try/catch block).
                console.log(`[API Test Connection] Webhook HEAD request to ${targetUrl} status: ${response.status}`);
                return NextResponse.json({ message: 'Webhook endpoint is reachable!' });

            } catch (error) {
                console.error("Webhook Test Connection Error:", error);
                return NextResponse.json({ error: `Connection failed: ${error.message}` }, { status: 500 });
            }

        case 'email':
            try {
                // Your existing, correct logic for verifying SMTP credentials.
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
                return NextResponse.json({ message: 'SMTP credentials verified successfully.' });

            } catch (error) {
                console.error('SMTP Test Connection Error:', error);
                return NextResponse.json({ error: `Connection failed: ${error.message}` }, { status: 500 });
            }

        default:
            return NextResponse.json({ error: `Test connection not implemented for type: ${type}` }, { status: 400 });
    }
}
