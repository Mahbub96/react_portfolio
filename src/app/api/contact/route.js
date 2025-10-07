import { NextResponse } from "next/server";
import nodemailer from "nodemailer";
import { sanitizeInput, validateEmail, secureResponse } from "@/lib/auth";

// Rate limiting storage (in production, use Redis or similar)
const rateLimit = new Map();

// Rate limiting function
function checkRateLimit(email) {
  const now = Date.now();
  const windowMs = 15 * 60 * 1000; // 15 minutes
  const maxRequests = 3; // Max 3 requests per 15 minutes

  if (!rateLimit.has(email)) {
    rateLimit.set(email, { count: 1, resetTime: now + windowMs });
    return true;
  }

  const userLimit = rateLimit.get(email);

  if (now > userLimit.resetTime) {
    rateLimit.set(email, { count: 1, resetTime: now + windowMs });
    return true;
  }

  if (userLimit.count >= maxRequests) {
    return false;
  }

  userLimit.count++;
  return true;
}

export async function POST(request) {
  try {
    const { name, email, subject, message } = await request.json();

    // Enhanced validation
    if (!name || !email || !subject || !message) {
      return secureResponse(
        {
          error: "All fields are required",
          details: {
            name: !name ? "Name is required" : null,
            email: !email ? "Email is required" : null,
            subject: !subject ? "Subject is required" : null,
            message: !message ? "Message is required" : null,
          },
        },
        400
      );
    }

    // Validate name length and content
    if (name.trim().length < 2 || name.trim().length > 100) {
      return secureResponse(
        { error: "Name must be between 2 and 100 characters" },
        400
      );
    }

    // Check for suspicious content in name
    if (/[<>]|javascript:|on\w+=/i.test(name)) {
      return secureResponse({ error: "Name contains invalid characters" }, 400);
    }

    // Enhanced email validation
    if (!validateEmail(email)) {
      return secureResponse({ error: "Invalid email format" }, 400);
    }

    // Check for disposable email domains (basic check)
    const disposableDomains = [
      "tempmail.org",
      "10minutemail.com",
      "guerrillamail.com",
    ];
    const emailDomain = email.split("@")[1];
    if (disposableDomains.includes(emailDomain)) {
      return secureResponse(
        { error: "Disposable email addresses are not allowed" },
        400
      );
    }

    // Validate subject length and content
    if (subject.trim().length < 5 || subject.trim().length > 200) {
      return secureResponse(
        { error: "Subject must be between 5 and 200 characters" },
        400
      );
    }

    // Check for suspicious content in subject
    if (/[<>]|javascript:|on\w+=/i.test(subject)) {
      return secureResponse(
        { error: "Subject contains invalid characters" },
        400
      );
    }

    // Validate message length and content
    if (message.trim().length < 10 || message.trim().length > 2000) {
      return secureResponse(
        { error: "Message must be between 10 and 2000 characters" },
        400
      );
    }

    // Check for suspicious content in message
    if (/[<>]|javascript:|on\w+=/i.test(message)) {
      return secureResponse(
        { error: "Message contains invalid characters" },
        400
      );
    }

    // Check rate limiting
    if (!checkRateLimit(email)) {
      return secureResponse(
        {
          error:
            "Too many requests. Please wait before sending another message.",
          retryAfter: "15 minutes",
        },
        429
      );
    }

    // Sanitize inputs using the secure function
    const sanitizedName = sanitizeInput(name.trim());
    const sanitizedSubject = sanitizeInput(subject.trim());
    const sanitizedMessage = sanitizeInput(message.trim());

    // Create transporter using SMTP
    const transporter = nodemailer.createTransporter({
      host: process.env.SMTP_HOST || "smtp.gmail.com",
      port: process.env.SMTP_PORT || 587,
      secure: false,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
      tls: {
        rejectUnauthorized: false,
      },
    });

    // Enhanced email content with better styling
    const mailOptions = {
      from: `"Portfolio Contact Form" <${process.env.EMAIL_USER}>`,
      to: [
        "admin@mahbub.dev",
        "support@mahbub.dev",
        "mahbubcse96@gmail.com",
      ].join(", "),
      replyTo: email,
      subject: `Portfolio Contact: ${sanitizedSubject}`,
      html: `
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>New Contact Form Submission</title>
          <style>
            body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 0; padding: 20px; background: #f8f9fa; }
            .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; }
            .header h1 { margin: 0; font-size: 24px; font-weight: 600; }
            .content { padding: 30px; }
            .section { margin-bottom: 25px; }
            .section h3 { color: #333; margin-bottom: 15px; font-size: 18px; border-bottom: 2px solid #e9ecef; padding-bottom: 8px; }
            .field { display: flex; margin-bottom: 12px; align-items: center; }
            .field strong { min-width: 80px; color: #495057; font-weight: 600; }
            .field span { color: #212529; margin-left: 10px; }
            .message-box { background: #f8f9fa; padding: 20px; border-radius: 8px; border-left: 4px solid #667eea; }
            .message-text { line-height: 1.6; color: #495057; margin: 0; }
            .footer { background: #e9ecef; padding: 20px; text-align: center; color: #6c757d; font-size: 14px; }
            .timestamp { color: #6c757d; font-style: italic; }
            .contact-info { background: #e3f2fd; padding: 15px; border-radius: 8px; margin-top: 20px; }
            .contact-info h4 { margin: 0 0 10px 0; color: #1976d2; }
            .contact-info p { margin: 5px 0; color: #424242; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>📧 New Contact Form Submission</h1>
            </div>
            
            <div class="content">
              <div class="section">
                <h3>👤 Contact Details</h3>
                <div class="field">
                  <strong>Name:</strong>
                  <span>${sanitizedName}</span>
                </div>
                <div class="field">
                  <strong>Email:</strong>
                  <span>${email}</span>
                </div>
                <div class="field">
                  <strong>Subject:</strong>
                  <span>${sanitizedSubject}</span>
                </div>
              </div>
              
              <div class="section">
                <h3>💬 Message</h3>
                <div class="message-box">
                  <p class="message-text">${sanitizedMessage.replace(
                    /\n/g,
                    "<br>"
                  )}</p>
                </div>
              </div>

              <div class="contact-info">
                <h4>📋 Submission Details</h4>
                <p><strong>Time:</strong> ${new Date().toLocaleString("en-US", {
                  timeZone: "Asia/Dhaka",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                  second: "2-digit",
                })}</p>
                <p><strong>IP Address:</strong> ${
                  request.headers.get("x-forwarded-for") ||
                  request.headers.get("x-real-ip") ||
                  "Unknown"
                }</p>
                <p><strong>User Agent:</strong> ${
                  request.headers.get("user-agent") || "Unknown"
                }</p>
              </div>
            </div>
            
            <div class="footer">
              <p>This message was sent from your portfolio contact form at <span class="timestamp">${new Date().toLocaleString()}</span></p>
              <p>Please respond to the sender's email address: <strong>${email}</strong></p>
            </div>
          </div>
        </body>
        </html>
      `,
      text: `
New Contact Form Submission

Contact Details:
- Name: ${sanitizedName}
- Email: ${email}
- Subject: ${sanitizedSubject}

Message:
${sanitizedMessage}

Submission Details:
- Time: ${new Date().toLocaleString("en-US", { timeZone: "Asia/Dhaka" })}
- IP: ${
        request.headers.get("x-forwarded-for") ||
        request.headers.get("x-real-ip") ||
        "Unknown"
      }

Sent from portfolio contact form at ${new Date().toLocaleString()}
      `,
    };

    // Send email
    await transporter.sendMail(mailOptions);

    // Log successful submission (without sensitive data)
    console.log(
      `✅ Contact form submitted by ${sanitizedName} at ${new Date().toISOString()}`
    );

    // Return success response
    return secureResponse({
      message: "Email sent successfully! I'll get back to you soon.",
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("❌ Error sending email:", error);

    // Enhanced error logging
    if (error.code === "EAUTH") {
      console.error(
        "🔐 Authentication failed - check EMAIL_USER and EMAIL_PASS"
      );
    } else if (error.code === "ECONNECTION") {
      console.error("🔌 Connection failed - check SMTP settings");
    } else if (error.code === "ETIMEDOUT") {
      console.error("⏰ Connection timeout - check network/firewall");
    } else if (error.code === "ENOTFOUND") {
      console.error("🌐 SMTP host not found - check SMTP_HOST");
    }

    // Return user-friendly error message
    return secureResponse(
      {
        error:
          "Failed to send email. Please try again later or contact me directly.",
        details:
          process.env.NODE_ENV === "development" ? error.message : undefined,
      },
      500
    );
  }
}

// Add OPTIONS method for CORS preflight
export async function OPTIONS(request) {
  return secureResponse(null, 200);
}
