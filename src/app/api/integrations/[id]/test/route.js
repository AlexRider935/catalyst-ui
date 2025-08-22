// src/app/api/integrations/[id]/test/route.js
import { NextResponse } from "next/server";
import { pool } from "@/lib/db";
import nodemailer from "nodemailer";
import crypto from "crypto";

const decryptSecret = (encrypted) =>
    Buffer.from(encrypted, "base64").toString("utf8");

export async function POST(request, { params }) {
    const { id } = await params;

    if (!id) {
        return NextResponse.json(
            { error: "Integration ID is required." },
            { status: 400 }
        );
    }

    const client = await pool.connect();
    try {
        const result = await client.query(
            "SELECT type, name, config FROM integrations WHERE id = $1",
            [id]
        );

        if (result.rows.length === 0) {
            return NextResponse.json(
                { error: "Integration not found." },
                { status: 404 }
            );
        }

        let { type, name, config } = result.rows[0];
        if (typeof config === "string") {
            config = JSON.parse(config);
        }

        switch (type) {
            case "email": {
                const body = await request.clone().json();
                const { testEmail } = body;
                if (!testEmail) {
                    return NextResponse.json(
                        { error: "A recipient email is required." },
                        { status: 400 }
                    );
                }

                if (config.apiKey) config.apiKey = decryptSecret(config.apiKey);
                if (config.smtpPass) config.smtpPass = decryptSecret(config.smtpPass);

                let transporter;
                if (config.authMethod === "api") {
                    transporter = nodemailer.createTransport({
                        host: "smtp.sendgrid.net",
                        port: 587,
                        secure: false,
                        auth: { user: "apikey", pass: config.apiKey },
                    });
                } else {
                    transporter = nodemailer.createTransport({
                        host: config.smtpServer,
                        port: parseInt(config.smtpPort, 10),
                        secure: config.smtpPort === "465",
                        auth: { user: config.smtpUser, pass: config.smtpPass },
                    });
                }

                await transporter.sendMail({
                    from: `"${config.senderName || "Project Catalyst"}" <${config.senderEmail
                        }>`,
                    to: testEmail,
                    subject: `Test Email from Project Catalyst`,
                    html: `<b>This is a test of the saved integration:</b><br/>Name: ${name}<br/>ID: ${id}`,
                });

                const updateResult = await client.query(
                    "UPDATE integrations SET status = $1, last_healthy_at = NOW() WHERE id = $2",
                    ["Healthy", id]
                );

                // --- REQUIRED CHANGE: Add diagnostic logging ---
                console.log(`DB UPDATE for ${id}: Rows affected = ${updateResult.rowCount}`);

                return NextResponse.json({
                    message: `Test email successfully sent to ${testEmail}!`,
                });
            }

            case "webhook": {
                if (!config?.targetUrl) {
                    return NextResponse.json(
                        { error: "Webhook integration is missing a valid targetUrl" },
                        { status: 400 }
                    );
                }

                if (config.secret) config.secret = decryptSecret(config.secret);

                const testPayload = {
                    event_type: "test_dispatch",
                    integration_name: name,
                    message: `This is a test dispatch from Project Catalyst at ${new Date().toISOString()}`,
                };
                const payloadString = JSON.stringify(testPayload);

                const headers = { "Content-Type": "application/json" };
                if (config.secret) {
                    const signature = crypto
                        .createHmac("sha256", config.secret)
                        .update(payloadString)
                        .digest("hex");
                    headers["X-Catalyst-Signature"] = signature;
                }

                const webhookResponse = await fetch(config.targetUrl, {
                    method: "POST",
                    headers,
                    body: payloadString,
                });

                if (!webhookResponse.ok) {
                    const errorText = await webhookResponse.text();
                    throw new Error(
                        `Remote endpoint returned ${webhookResponse.status}: ${errorText}`
                    );
                }

                const updateResult = await client.query(
                    "UPDATE integrations SET status = $1, last_healthy_at = NOW() WHERE id = $2",
                    ["Healthy", id]
                );

                // --- REQUIRED CHANGE: Add diagnostic logging ---
                console.log(`DB UPDATE for ${id}: Rows affected = ${updateResult.rowCount}`);

                return NextResponse.json({
                    message: "Test webhook successfully dispatched!",
                });
            }

            default:
                return NextResponse.json(
                    { error: `Dispatch logic not implemented for type: '${type}'` },
                    { status: 501 }
                );
        }
    } catch (error) {
        await client.query(
            "UPDATE integrations SET status = $1 WHERE id = $2",
            ["Error", id]
        );
        console.error(`API Test Dispatch Error for integration ${id}:`, error);
        return NextResponse.json(
            { error: "Failed to send test dispatch.", details: error.message },
            { status: 500 }
        );
    } finally {
        client.release();
    }
}