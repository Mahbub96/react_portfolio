/**
 * Generate OpenAPI 3.1.0 specification files:
 *   - openapi.yaml (root workspace)
 *   - public/openapi.json (public web access)
 *
 * Fully typed and documented for Model Context Protocol (MCP) servers and AI tool calling.
 */

import { writeFileSync, mkdirSync, readFileSync } from "fs";
import path from "path";
import yaml from "js-yaml";

const rootDir = process.cwd();
const pkg = JSON.parse(readFileSync(path.join(rootDir, "package.json"), "utf8"));

const spec = {
  openapi: "3.1.0",
  info: {
    title: "Mahbub Portfolio & CMS API",
    version: pkg.version || "1.6.0",
    description:
      "Comprehensive REST API specification for Mahbub Alam's Portfolio, Blog CMS, Visitor Analytics, Interaction Tracking, and Inquiry Management. Designed specifically for AI Agents, Model Context Protocol (MCP) tool servers, and automated development workflows.",
    contact: {
      name: "Mahbub Alam",
      email: "mahbubcse96@gmail.com",
      url: "https://mahbub.dev",
    },
    license: {
      name: "MIT",
      url: "https://opensource.org/licenses/MIT",
    },
  },
  servers: [
    {
      url: "https://mahbub.dev",
      description: "Production Server",
    },
    {
      url: "https://test.mahbub.dev",
      description: "Staging Server",
    },
    {
      url: "http://localhost:3000",
      description: "Local Development Server",
    },
  ],
  tags: [
    { name: "Authentication", description: "Admin session authentication, rate-limited login, session validation, and logout audit" },
    { name: "Portfolio", description: "Portfolio dynamic content management (Skills, Projects, Education, Experience, Contact)" },
    { name: "Blog - Admin", description: "Full-featured blog CMS: creation, editing with optimistic locking, publication, SEO audit, tags, media, and AI drafting" },
    { name: "Blog - Public", description: "Public blog reader endpoints: view counters and tracking" },
    { name: "Contact & Inquiries", description: "Inquiry submission, rate limiting, SMTP dispatch, and admin message management" },
    { name: "Analytics & Telemetry", description: "Real-time telemetry, session replays, click & movement heatmaps, event batches, and dashboards" },
    { name: "Visitors", description: "Visitor tracking beacons and aggregated demographic statistics" },
    { name: "Resume & CV", description: "Dynamic JSON CV generation and static/dynamic PDF downloads" },
    { name: "Media & Uploads", description: "Image uploads with responsive variants, SEO metadata injection, and YouTube thumbnail caching" },
  ],
  paths: {
    // -------------------------------------------------------------------------
    // AUTHENTICATION
    // -------------------------------------------------------------------------
    "/api/auth/login": {
      post: {
        operationId: "adminLogin",
        summary: "Admin login authentication",
        description:
          "Authenticates the site administrator using username and password. Protected by brute-force rate limiting (max 5 failed attempts per 15 minutes). On success, issues a secure HTTP-only cookie (`admin_session` in dev, `__Host-mahbub_admin` in prod) containing a signed JWT. Records login attempts for auditing.",
        tags: ["Authentication"],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["username", "password"],
                properties: {
                  username: {
                    type: "string",
                    description: "Admin username",
                    example: "mahbub",
                  },
                  password: {
                    type: "string",
                    format: "password",
                    description: "Admin password",
                    example: "SecureP@ssw0rd!2026",
                  },
                  timestamp: {
                    type: "string",
                    format: "date-time",
                    description: "Client timestamp of the attempt",
                    example: "2026-10-15T06:00:00.000Z",
                  },
                  userAgent: {
                    type: "string",
                    description: "Client User-Agent string",
                    example: "Mozilla/5.0 (X11; Linux x86_64)",
                  },
                },
              },
            },
          },
        },
        responses: {
          200: {
            description: "Login successful; sets HTTP-only session cookie",
            headers: {
              "Set-Cookie": {
                schema: { type: "string" },
                description: "HTTP-only session cookie",
              },
            },
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    success: { type: "boolean", example: true },
                    message: { type: "string", example: "Login successful" },
                    userRole: { type: "string", example: "admin" },
                    expiresAt: { type: "string", format: "date-time" },
                  },
                },
              },
            },
          },
          400: {
            description: "Missing username or password",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/AuthErrorResponse" },
              },
            },
          },
          401: {
            description: "Invalid credentials",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    success: { type: "boolean", example: false },
                    message: { type: "string", example: "Invalid credentials" },
                    remainingAttempts: { type: "integer", example: 3 },
                  },
                },
              },
            },
          },
          429: {
            description: "Account temporarily locked due to too many failed attempts",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    success: { type: "boolean", example: false },
                    message: { type: "string", example: "Account temporarily locked due to too many failed attempts" },
                    lockedOut: { type: "boolean", example: true },
                    lockoutTime: { type: "integer", description: "Lockout duration in milliseconds", example: 900000 },
                  },
                },
              },
            },
          },
          503: {
            description: "Admin configuration or database unavailable",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/AuthErrorResponse" },
              },
            },
          },
          500: {
            description: "Internal server error",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/AuthErrorResponse" },
              },
            },
          },
        },
      },
      get: {
        operationId: "cleanupExpiredAuth",
        summary: "Clean up expired sessions and login records",
        description: "Admin-only maintenance operation. Deletes expired session tokens and login audit logs older than 90 days from MongoDB.",
        tags: ["Authentication"],
        security: [{ cookieAuth: [] }],
        responses: {
          200: {
            description: "Cleanup completed successfully",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    message: { type: "string", example: "Cleanup completed" },
                  },
                },
              },
            },
          },
          401: {
            description: "Unauthorized - admin session cookie required",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
          500: {
            description: "Cleanup failed",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
        },
      },
    },

    "/api/auth/session": {
      get: {
        operationId: "checkAdminSession",
        summary: "Verify admin session validity",
        description: "Checks whether the request carries a valid, active HTTP-only admin session cookie. Returns authenticated status, user role, and session expiration timestamp.",
        tags: ["Authentication"],
        responses: {
          200: {
            description: "Session status check",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    authenticated: { type: "boolean", example: true },
                    role: { type: "string", example: "admin" },
                    expiresAt: { type: "string", format: "date-time", example: "2026-10-16T06:00:00.000Z" },
                  },
                },
              },
            },
          },
        },
      },
    },

    "/api/auth/logout": {
      post: {
        operationId: "adminLogout",
        summary: "Log out caller admin session",
        description: "Revokes the caller's active session in the database, records a logout audit event with duration, and clears the HTTP-only session cookie.",
        tags: ["Authentication"],
        responses: {
          200: {
            description: "Logout successful and cookie cleared",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    success: { type: "boolean", example: true },
                    message: { type: "string", example: "Logout successful" },
                  },
                },
              },
            },
          },
        },
      },
      delete: {
        operationId: "forceLogoutUser",
        summary: "Force terminate all sessions for a user",
        description: "Admin-only action. Deactivates all active sessions for a target username and logs a forced termination audit record.",
        tags: ["Authentication"],
        security: [{ cookieAuth: [] }],
        parameters: [
          {
            name: "username",
            in: "query",
            required: true,
            description: "Username whose sessions should be terminated",
            schema: { type: "string", example: "mahbub" },
          },
          {
            name: "reason",
            in: "query",
            required: false,
            description: "Reason for terminating sessions",
            schema: { type: "string", default: "admin_forced", example: "security_precaution" },
          },
        ],
        responses: {
          200: {
            description: "All user sessions terminated",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    success: { type: "boolean", example: true },
                    message: { type: "string", example: "All sessions terminated successfully" },
                    sessionsTerminated: { type: "integer", example: 2 },
                  },
                },
              },
            },
          },
          400: {
            description: "Missing username parameter",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/AuthErrorResponse" },
              },
            },
          },
          401: {
            description: "Unauthorized",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/AuthErrorResponse" },
              },
            },
          },
          500: {
            description: "Server error terminating sessions",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/AuthErrorResponse" },
              },
            },
          },
        },
      },
    },

    "/api/auth/login-history": {
      get: {
        operationId: "getLoginHistory",
        summary: "Get login attempt logs and statistics",
        description: "Admin-only. Fetches the last 30 days of login attempts (up to 100 entries), recent successful logins, and aggregate metrics (total attempts, successful logins, failed logins, success rate).",
        tags: ["Authentication"],
        security: [{ cookieAuth: [] }],
        responses: {
          200: {
            description: "Login audit logs and aggregate statistics",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    success: { type: "boolean", example: true },
                    data: {
                      type: "object",
                      properties: {
                        loginAttempts: {
                          type: "array",
                          items: { $ref: "#/components/schemas/LoginAttempt" },
                        },
                        statistics: {
                          type: "object",
                          properties: {
                            totalAttempts: { type: "integer", example: 45 },
                            successfulLogins: { type: "integer", example: 42 },
                            failedLogins: { type: "integer", example: 3 },
                            successRate: { type: "string", example: "93.3" },
                          },
                        },
                        recentSuccessfulLogins: {
                          type: "array",
                          items: { $ref: "#/components/schemas/LoginAttempt" },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
          401: {
            description: "Unauthorized",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
          500: {
            description: "Internal server error",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/AuthErrorResponse" },
              },
            },
          },
        },
      },
    },

    // -------------------------------------------------------------------------
    // PORTFOLIO
    // -------------------------------------------------------------------------
    "/api/portfolio": {
      get: {
        operationId: "getPortfolioData",
        summary: "Get all portfolio data collections",
        description: "Fetches full public portfolio data transformed into key-value sections (`Skills`, `Projects`, `Education`, `Experience`, `Contact`, `profile`). Response is cached on CDN/edge for 1 hour.",
        tags: ["Portfolio"],
        responses: {
          200: {
            description: "Portfolio dataset dictionary",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  additionalProperties: {
                    type: "object",
                    properties: {
                      data: {
                        description: "Collection items array or object",
                        oneOf: [{ type: "array", items: { type: "object" } }, { type: "object" }],
                      },
                      lastUpdate: { type: "string", format: "date-time" },
                    },
                  },
                  example: {
                    Skills: { data: [{ name: "React", level: 90, icon: "react" }], lastUpdate: "2026-10-10T12:00:00Z" },
                    Projects: { data: [{ title: "Whisper Bangla", description: "ASR system" }], lastUpdate: "2026-10-12T10:00:00Z" },
                  },
                },
              },
            },
          },
          500: {
            description: "Failed to fetch portfolio data",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
        },
      },
      post: {
        operationId: "addPortfolioItem",
        summary: "Add item to a portfolio collection",
        description: "Admin-only with `write:portfolio` permission. Adds a new item to the specified portfolio collection. Sanitizes strings, generates unique ID, prevents duplicate skill names, and busts caches.",
        tags: ["Portfolio"],
        security: [{ cookieAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["collectionName", "newItem"],
                properties: {
                  collectionName: {
                    type: "string",
                    enum: ["Skills", "Projects", "Education", "Experience", "Contact"],
                    description: "Target portfolio collection",
                    example: "Projects",
                  },
                  newItem: {
                    type: "object",
                    description: "Object data representing the new portfolio item",
                    example: {
                      title: "Distributed Task Engine",
                      description: "High-throughput asynchronous job processor built with Node.js and Redis",
                      technologies: ["Node.js", "Redis", "Docker"],
                      github: "https://github.com/mahbub96/distributed-engine",
                    },
                  },
                },
              },
            },
          },
        },
        responses: {
          200: {
            description: "Item successfully added",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    id: { type: "string", example: "Projects_1729000000000_abc123xyz" },
                  },
                },
              },
            },
          },
          400: {
            description: "Invalid collection name, duplicate item, or missing payload",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
          401: {
            description: "Unauthorized",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
          403: {
            description: "Insufficient permissions or unauthorized host domain",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
          500: {
            description: "Failed to add portfolio item",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
        },
      },
    },

    "/api/portfolio/{collectionName}/{documentId}": {
      put: {
        operationId: "updatePortfolioItem",
        summary: "Update an item in a portfolio collection",
        description: "Admin-only. Updates an existing item matching `documentId` within `collectionName`. Handles special case for `portfolio_data/profile` image updates.",
        tags: ["Portfolio"],
        security: [{ cookieAuth: [] }],
        parameters: [
          {
            name: "collectionName",
            in: "path",
            required: true,
            schema: { type: "string" },
            description: "Collection name (e.g. Projects, Skills, Experience, profile)",
            example: "Projects",
          },
          {
            name: "documentId",
            in: "path",
            required: true,
            schema: { type: "string" },
            description: "Unique item ID within the collection",
            example: "Projects_1729000000000_abc123xyz",
          },
        ],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                description: "Updated item fields",
                example: {
                  title: "Distributed Task Engine v2",
                  description: "Updated high-throughput asynchronous job processor",
                  technologies: ["Node.js", "Redis", "Docker", "RabbitMQ"],
                },
              },
            },
          },
        },
        responses: {
          200: {
            description: "Item updated successfully",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    success: { type: "boolean", example: true },
                    data: { type: "object" },
                  },
                },
              },
            },
          },
          401: {
            description: "Unauthorized",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
          404: {
            description: "Document or collection item not found",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
          500: {
            description: "Failed to update item",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
        },
      },
      delete: {
        operationId: "deletePortfolioItem",
        summary: "Delete an item from a portfolio collection",
        description: "Admin-only. Removes the specified item by `documentId` from the collection's data array.",
        tags: ["Portfolio"],
        security: [{ cookieAuth: [] }],
        parameters: [
          {
            name: "collectionName",
            in: "path",
            required: true,
            schema: { type: "string" },
            example: "Projects",
          },
          {
            name: "documentId",
            in: "path",
            required: true,
            schema: { type: "string" },
            example: "Projects_1729000000000_abc123xyz",
          },
        ],
        responses: {
          200: {
            description: "Item deleted successfully",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    success: { type: "boolean", example: true },
                  },
                },
              },
            },
          },
          401: {
            description: "Unauthorized",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
          404: {
            description: "Collection not found",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
          500: {
            description: "Failed to delete item",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
        },
      },
    },

    "/api/portfolio/default-data": {
      get: {
        operationId: "getDefaultDataStatus",
        summary: "Check default portfolio data endpoint readiness",
        description: "Verifies database connectivity and ready status for default data seeding.",
        tags: ["Portfolio"],
        responses: {
          200: {
            description: "Endpoint ready",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    success: { type: "boolean", example: true },
                    message: { type: "string", example: "Default data endpoint ready" },
                  },
                },
              },
            },
          },
          500: {
            description: "Database connection failed",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
        },
      },
      post: {
        operationId: "seedDefaultData",
        summary: "Seed default portfolio collections into database",
        description: "Initializes MongoDB portfolio collections from static fallback JSON files if collections are empty. Domain restricted to `mahbub.dev` and `localhost:3000`.",
        tags: ["Portfolio"],
        responses: {
          200: {
            description: "Default data successfully loaded",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    success: { type: "boolean", example: true },
                    message: { type: "string", example: "Default data population completed" },
                    results: { type: "object" },
                  },
                },
              },
            },
          },
          403: {
            description: "Domain not authorized to trigger seed",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
          500: {
            description: "Failed to populate default data",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
        },
      },
    },

    // -------------------------------------------------------------------------
    // CONTACT & INQUIRIES
    // -------------------------------------------------------------------------
    "/api/contact": {
      post: {
        operationId: "sendContactMessage",
        summary: "Submit contact inquiry message",
        description:
          "Public endpoint for visitors to send messages. Implements robust validation (name 2-100 chars, email format check, disposable domain block, subject 5-200 chars, message 10-2000 chars, script injection removal) and rate limiting (max 5 submissions per 15 min per IP+email). Persists to MongoDB first; then dispatches via SMTP (Nodemailer). If SMTP is unconfigured or fails, gracefully responds with received status and marks message status as `saved_locally`.",
        tags: ["Contact & Inquiries"],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["name", "email", "subject", "message"],
                properties: {
                  name: {
                    type: "string",
                    minLength: 2,
                    maxLength: 100,
                    description: "Sender's full name",
                    example: "John Doe",
                  },
                  email: {
                    type: "string",
                    format: "email",
                    description: "Sender's contact email",
                    example: "john.doe@example.com",
                  },
                  subject: {
                    type: "string",
                    minLength: 5,
                    maxLength: 200,
                    description: "Subject of the message",
                    example: "Collaboration Inquiry regarding Full-Stack Architecture",
                  },
                  message: {
                    type: "string",
                    minLength: 10,
                    maxLength: 2000,
                    description: "Message content",
                    example: "Hi Mahbub, I came across your portfolio and would love to discuss a consulting opportunity for our backend migration.",
                  },
                },
              },
            },
          },
        },
        responses: {
          200: {
            description: "Message successfully received and/or emailed",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    message: { type: "string", example: "Email sent successfully! I'll get back to you soon." },
                    timestamp: { type: "string", format: "date-time" },
                    deliveryMode: { type: "string", enum: ["sent", "saved_locally"], example: "sent" },
                  },
                },
              },
            },
          },
          400: {
            description: "Validation failure (invalid characters, length violations, disposable email)",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    error: { type: "string", example: "All fields are required" },
                    details: { type: "object" },
                  },
                },
              },
            },
          },
          429: {
            description: "Rate limit exceeded",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    error: { type: "string", example: "Too many requests. Please wait before sending another message." },
                    retryAfter: { type: "string", example: "15 minutes" },
                  },
                },
              },
            },
          },
          500: {
            description: "Unexpected error during message processing",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
        },
      },
      options: {
        operationId: "contactCorsPreflight",
        summary: "CORS preflight for contact endpoint",
        description: "Returns 200 OK for cross-origin preflight checks.",
        tags: ["Contact & Inquiries"],
        responses: {
          200: { description: "CORS preflight successful" },
        },
      },
    },

    "/api/admin/messages": {
      get: {
        operationId: "getContactMessages",
        summary: "List contact inquiries and metrics",
        description: "Admin-only. Returns paginated contact inquiries (up to 100), filterable by status (`all`, `pending`, `sent`, `saved_locally`, `failed`) and regex search across name, email, subject, and message. Includes status aggregate counters.",
        tags: ["Contact & Inquiries"],
        security: [{ cookieAuth: [] }],
        parameters: [
          {
            name: "status",
            in: "query",
            required: false,
            schema: { type: "string", enum: ["all", "pending", "sent", "saved_locally", "failed"], default: "all" },
            description: "Filter inquiries by status",
          },
          {
            name: "q",
            in: "query",
            required: false,
            schema: { type: "string" },
            description: "Search keyword matching name, email, subject, or message",
          },
        ],
        responses: {
          200: {
            description: "List of contact messages and stats",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    items: {
                      type: "array",
                      items: { $ref: "#/components/schemas/ContactMessage" },
                    },
                    stats: {
                      type: "object",
                      properties: {
                        total: { type: "integer", example: 12 },
                        saved_locally: { type: "integer", example: 2 },
                        sent: { type: "integer", example: 10 },
                        failed: { type: "integer", example: 0 },
                      },
                    },
                  },
                },
              },
            },
          },
          401: {
            description: "Unauthorized",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
          500: {
            description: "Failed to retrieve messages",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
        },
      },
    },

    "/api/admin/messages/{id}": {
      get: {
        operationId: "getContactMessageById",
        summary: "Get single contact inquiry details",
        description: "Admin-only. Retrieves full details of a contact message by MongoDB ObjectId, including client IP, user agent, timestamps, and delivery error logs.",
        tags: ["Contact & Inquiries"],
        security: [{ cookieAuth: [] }],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "string" },
            description: "MongoDB ObjectId of the contact message",
            example: "670c1d2e3f4a5b6c7d8e9f01",
          },
        ],
        responses: {
          200: {
            description: "Contact message details",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    message: { $ref: "#/components/schemas/ContactMessage" },
                  },
                },
              },
            },
          },
          401: {
            description: "Unauthorized",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
          404: {
            description: "Message not found",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
          500: {
            description: "Server error",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
        },
      },
      patch: {
        operationId: "updateContactMessageStatus",
        summary: "Update inquiry workflow status",
        description: "Admin-only. Updates the status of an inquiry (`pending`, `sent`, `saved_locally`, `failed`).",
        tags: ["Contact & Inquiries"],
        security: [{ cookieAuth: [] }],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "string" },
            example: "670c1d2e3f4a5b6c7d8e9f01",
          },
        ],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["status"],
                properties: {
                  status: {
                    type: "string",
                    enum: ["pending", "sent", "saved_locally", "failed"],
                    example: "sent",
                  },
                },
              },
            },
          },
        },
        responses: {
          200: {
            description: "Status successfully updated",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    success: { type: "boolean", example: true },
                    message: {
                      type: "object",
                      properties: {
                        id: { type: "string" },
                        status: { type: "string" },
                      },
                    },
                  },
                },
              },
            },
          },
          400: {
            description: "Invalid status value",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
          401: {
            description: "Unauthorized",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
          404: {
            description: "Message not found",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
          500: {
            description: "Server error",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
        },
      },
      delete: {
        operationId: "deleteContactMessage",
        summary: "Delete contact inquiry",
        description: "Admin-only. Permanently deletes the message record from MongoDB.",
        tags: ["Contact & Inquiries"],
        security: [{ cookieAuth: [] }],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "string" },
            example: "670c1d2e3f4a5b6c7d8e9f01",
          },
        ],
        responses: {
          200: {
            description: "Inquiry deleted successfully",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    success: { type: "boolean", example: true },
                    message: { type: "string", example: "Inquiry deleted successfully" },
                  },
                },
              },
            },
          },
          401: {
            description: "Unauthorized",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
          404: {
            description: "Message not found",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
          500: {
            description: "Server error",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
        },
      },
    },

    // -------------------------------------------------------------------------
    // BLOG - ADMIN
    // -------------------------------------------------------------------------
    "/api/admin/blog/posts": {
      get: {
        operationId: "listBlogPosts",
        summary: "List blog posts for admin",
        description: "Admin-only. Returns blog posts matching status filter (`all`, `draft`, `scheduled`, `published`) and title/slug keyword query.",
        tags: ["Blog - Admin"],
        security: [{ cookieAuth: [] }],
        parameters: [
          {
            name: "status",
            in: "query",
            required: false,
            schema: { type: "string", enum: ["all", "draft", "scheduled", "published"], default: "all" },
            description: "Post status filter",
          },
          {
            name: "q",
            in: "query",
            required: false,
            schema: { type: "string" },
            description: "Search filter for title or slug",
          },
        ],
        responses: {
          200: {
            description: "Array of blog posts summary",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    posts: {
                      type: "array",
                      items: { $ref: "#/components/schemas/BlogPostSummary" },
                    },
                  },
                },
              },
            },
          },
          401: {
            description: "Unauthorized",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
        },
      },
      post: {
        operationId: "createBlogPost",
        summary: "Create a new draft blog post",
        description: "Admin-only. Creates a new blog post in draft status with an initial empty document structure and default title.",
        tags: ["Blog - Admin"],
        security: [{ cookieAuth: [] }],
        requestBody: {
          required: false,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  title: {
                    type: "string",
                    description: "Initial title for the post",
                    example: "Building MCP Servers for High-Scale Production",
                  },
                },
              },
            },
          },
        },
        responses: {
          200: {
            description: "Draft created successfully",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    post: { $ref: "#/components/schemas/BlogPost" },
                  },
                },
              },
            },
          },
          401: {
            description: "Unauthorized",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
        },
      },
    },

    "/api/admin/blog/posts/{id}": {
      get: {
        operationId: "getBlogPostById",
        summary: "Get blog post by ID for editing",
        description: "Admin-only. Fetches the complete post document including Tiptap editor JSON (`contentJson`), SEO meta fields, cover image, and optimistic locking `version` number.",
        tags: ["Blog - Admin"],
        security: [{ cookieAuth: [] }],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "string" },
            description: "BlogPost MongoDB ObjectId",
            example: "670c1d2e3f4a5b6c7d8e9f02",
          },
        ],
        responses: {
          200: {
            description: "Full blog post document",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    post: { $ref: "#/components/schemas/BlogPost" },
                  },
                },
              },
            },
          },
          401: {
            description: "Unauthorized",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
          404: {
            description: "Post not found",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
        },
      },
      patch: {
        operationId: "updateBlogPost",
        summary: "Autosave / update blog post",
        description:
          "Admin-only autosave endpoint. Performs partial updates guarded by the post's optimistic locking `version` number. Rejects updates if the version has changed on the server (returning 409 conflict). Validates Tiptap content, vocabulary constraints, and SEO limits.",
        tags: ["Blog - Admin"],
        security: [{ cookieAuth: [] }],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "string" },
            example: "670c1d2e3f4a5b6c7d8e9f02",
          },
        ],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/BlogPostPatch" },
            },
          },
        },
        responses: {
          200: {
            description: "Post updated successfully",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    post: { $ref: "#/components/schemas/BlogPost" },
                  },
                },
              },
            },
          },
          400: {
            description: "Schema validation error",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
          401: {
            description: "Unauthorized",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
          409: {
            description: "Version mismatch conflict (post was modified elsewhere)",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
        },
      },
      delete: {
        operationId: "deleteBlogPost",
        summary: "Delete a blog post",
        description: "Admin-only. Permanently deletes the blog post and any scheduled release jobs.",
        tags: ["Blog - Admin"],
        security: [{ cookieAuth: [] }],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "string" },
            example: "670c1d2e3f4a5b6c7d8e9f02",
          },
        ],
        responses: {
          200: {
            description: "Post deleted",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    success: { type: "boolean", example: true },
                  },
                },
              },
            },
          },
          401: {
            description: "Unauthorized",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
          404: {
            description: "Post not found",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
        },
      },
    },

    "/api/admin/blog/posts/{id}/publish": {
      post: {
        operationId: "publishBlogPost",
        summary: "Publish immediately or schedule blog post",
        description:
          "Admin-only. Validates publication completeness (title, valid slug, excerpt, content, meta tags). If `publishedAt` is in the future, sets status to `scheduled`. If current or omitted, sets status to `published`, compiles static HTML snapshot with syntax highlighting, and updates RSS/sitemaps.",
        tags: ["Blog - Admin"],
        security: [{ cookieAuth: [] }],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "string" },
            example: "670c1d2e3f4a5b6c7d8e9f02",
          },
        ],
        requestBody: {
          required: false,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  publishedAt: {
                    type: "string",
                    format: "date-time",
                    description: "ISO 8601 datetime with timezone offset for scheduled release",
                    example: "2026-10-20T09:00:00+06:00",
                  },
                },
              },
            },
          },
        },
        responses: {
          200: {
            description: "Post successfully published or scheduled",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    post: { $ref: "#/components/schemas/BlogPost" },
                  },
                },
              },
            },
          },
          400: {
            description: "Checklist failed or validation error",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
          401: {
            description: "Unauthorized",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
          404: {
            description: "Post not found",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
        },
      },
    },

    "/api/admin/blog/posts/{id}/unpublish": {
      post: {
        operationId: "unpublishBlogPost",
        summary: "Unpublish post to draft",
        description: "Admin-only. Reverts a live or scheduled blog post back to `draft` status, withdrawing it from the public feed and sitemaps.",
        tags: ["Blog - Admin"],
        security: [{ cookieAuth: [] }],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "string" },
            example: "670c1d2e3f4a5b6c7d8e9f02",
          },
        ],
        responses: {
          200: {
            description: "Post reverted to draft",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    post: { $ref: "#/components/schemas/BlogPost" },
                  },
                },
              },
            },
          },
          401: {
            description: "Unauthorized",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
          404: {
            description: "Post not found",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
        },
      },
    },

    "/api/admin/blog/posts/{id}/check": {
      get: {
        operationId: "checkPostSeo",
        summary: "Run pre-publish checklist and SEO verification",
        description: "Admin-only. Evaluates the post against publication readiness criteria (title length, meta title, meta description, word count, excerpt, cover image, slug uniqueness) without modifying the post.",
        tags: ["Blog - Admin"],
        security: [{ cookieAuth: [] }],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "string" },
            example: "670c1d2e3f4a5b6c7d8e9f02",
          },
        ],
        responses: {
          200: {
            description: "Pre-publish checklist results",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    ok: { type: "boolean", example: true },
                    checks: {
                      type: "array",
                      items: {
                        type: "object",
                        properties: {
                          name: { type: "string", example: "title" },
                          pass: { type: "boolean", example: true },
                          message: { type: "string", example: "Title length is optimal" },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
          401: {
            description: "Unauthorized",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
          404: {
            description: "Post not found",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
        },
      },
    },

    "/api/admin/blog/slug-check": {
      get: {
        operationId: "checkBlogSlug",
        summary: "Check slug availability and collision",
        description: "Admin-only. Validates whether a proposed URL slug is currently unused. Accepts an optional `id` parameter to exclude the current post being edited.",
        tags: ["Blog - Admin"],
        security: [{ cookieAuth: [] }],
        parameters: [
          {
            name: "slug",
            in: "query",
            required: true,
            schema: { type: "string" },
            description: "Proposed URL slug",
            example: "mcp-server-architecture",
          },
          {
            name: "id",
            in: "query",
            required: false,
            schema: { type: "string" },
            description: "Current post ID to exclude from uniqueness check",
          },
        ],
        responses: {
          200: {
            description: "Slug check status",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    available: { type: "boolean", example: true },
                    slug: { type: "string", example: "mcp-server-architecture" },
                  },
                },
              },
            },
          },
          401: {
            description: "Unauthorized",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
        },
      },
    },

    "/api/admin/blog/tags": {
      get: {
        operationId: "listBlogTags",
        summary: "List all tags used across blog posts",
        description: "Admin-only. Returns unique tags list sorted alphabetically for auto-completion in the blog post editor.",
        tags: ["Blog - Admin"],
        security: [{ cookieAuth: [] }],
        responses: {
          200: {
            description: "List of tags",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    tags: {
                      type: "array",
                      items: { type: "string" },
                      example: ["AI", "Architecture", "Bengali ASR", "Next.js", "Node.js", "Python"],
                    },
                  },
                },
              },
            },
          },
          401: {
            description: "Unauthorized",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
        },
      },
    },

    "/api/admin/blog/media": {
      get: {
        operationId: "listBlogMedia",
        summary: "List recent media library uploads",
        description: "Admin-only. Returns up to 120 most recent image uploads with dimensions, responsive variant URLs, original filename, and upload date for the media picker.",
        tags: ["Media & Uploads"],
        security: [{ cookieAuth: [] }],
        responses: {
          200: {
            description: "Recent blog media items",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    items: {
                      type: "array",
                      items: { $ref: "#/components/schemas/BlogMediaItem" },
                    },
                  },
                },
              },
            },
          },
          401: {
            description: "Unauthorized",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
        },
      },
      post: {
        operationId: "uploadBlogImage",
        summary: "Upload new blog image with responsive variants",
        description:
          "Admin-only. Accepts multipart/form-data containing 1 to 4 browser-downscaled variants (`variant`), an optional 1200x630 social card crop (`og`), and original file name (`name`). Stores images in web-accessible storage and records SHA-256 hashes. Max request size 8MB.",
        tags: ["Media & Uploads"],
        security: [{ cookieAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "multipart/form-data": {
              schema: {
                type: "object",
                required: ["variant"],
                properties: {
                  variant: {
                    type: "array",
                    items: { type: "string", format: "binary" },
                    description: "1 to 4 responsive image sizes (e.g. 1920w, 1280w, 640w)",
                  },
                  og: {
                    type: "string",
                    format: "binary",
                    description: "Optional 1200x630 OpenGraph social share crop",
                  },
                  name: {
                    type: "string",
                    description: "Original filename",
                    example: "system-architecture-diagram.png",
                  },
                },
              },
            },
          },
        },
        responses: {
          200: {
            description: "Image uploaded and stored",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    media: { $ref: "#/components/schemas/ImageRef" },
                  },
                },
              },
            },
          },
          401: {
            description: "Unauthorized",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
          413: {
            description: "Payload larger than 8MB",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
        },
      },
    },

    "/api/admin/blog/media/{id}": {
      post: {
        operationId: "uploadBlogImageVariant",
        summary: "Add size variant or OpenGraph crop to existing media",
        description: "Admin-only. Appends an additional responsive size variant or OpenGraph social card crop to an existing media record. Max file size 4MB.",
        tags: ["Media & Uploads"],
        security: [{ cookieAuth: [] }],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "string" },
            description: "BlogMedia MongoDB ObjectId",
            example: "670c1d2e3f4a5b6c7d8e9f03",
          },
        ],
        requestBody: {
          required: true,
          content: {
            "multipart/form-data": {
              schema: {
                type: "object",
                properties: {
                  variant: {
                    type: "string",
                    format: "binary",
                    description: "Image variant file binary",
                  },
                  og: {
                    type: "string",
                    format: "binary",
                    description: "Social crop file binary",
                  },
                },
              },
            },
          },
        },
        responses: {
          200: {
            description: "Variant added successfully",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    media: { $ref: "#/components/schemas/ImageRef" },
                  },
                },
              },
            },
          },
          401: {
            description: "Unauthorized",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
          404: {
            description: "Image not found",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
          413: {
            description: "Variant larger than 4MB",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
          422: {
            description: "No image file received in request",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
        },
      },
      delete: {
        operationId: "deleteBlogMedia",
        summary: "Delete an uploaded image",
        description: "Admin-only. Deletes the media file and variants from disk. If the image is referenced in any draft, scheduled, or published post, the deletion is rejected with HTTP 409 Conflict.",
        tags: ["Media & Uploads"],
        security: [{ cookieAuth: [] }],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "string" },
            example: "670c1d2e3f4a5b6c7d8e9f03",
          },
        ],
        responses: {
          200: {
            description: "Image deleted",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    deleted: { type: "boolean", example: true },
                  },
                },
              },
            },
          },
          401: {
            description: "Unauthorized",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
          404: {
            description: "Image not found",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
          409: {
            description: "Conflict: Image is currently referenced by posts",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    error: { type: "string", example: "This image is used in a post" },
                    posts: { type: "array", items: { type: "string" }, example: ["Building Scalable Microservices"] },
                  },
                },
              },
            },
          },
        },
      },
    },

    "/api/admin/blog/media/youtube": {
      post: {
        operationId: "prepareYouTubeEmbed",
        summary: "Prepare privacy-friendly YouTube embed",
        description: "Admin-only. Downloads video metadata via YouTube oEmbed, mirrors the video thumbnail locally into `/uploads/blog/`, and returns metadata so YouTube iframe scripts are deferred until visitor interaction.",
        tags: ["Media & Uploads"],
        security: [{ cookieAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["url"],
                properties: {
                  url: {
                    type: "string",
                    description: "YouTube watch or short URL",
                    example: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
                  },
                },
              },
            },
          },
        },
        responses: {
          200: {
            description: "Embed data prepared",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    videoId: { type: "string", example: "dQw4w9WgXcQ" },
                    title: { type: "string", example: "Architecture Deep Dive" },
                    thumbSrc: { type: "string", nullable: true, example: "/uploads/blog/youtube-dQw4w9WgXcQ.jpg" },
                  },
                },
              },
            },
          },
          401: {
            description: "Unauthorized",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
          422: {
            description: "Not a valid YouTube video URL",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
        },
      },
    },

    "/api/admin/blog/ai/generate": {
      post: {
        operationId: "generateAiFieldOrBody",
        summary: "Generate blog post field or markdown body with AI",
        description:
          "Admin-only. Generates metadata suggestions (`title`, `excerpt`, `metaTitle`, `metaDescription`, `slug`, `tags`, `coverAlt`, `imageAlt`) or streams long-form markdown body (`body.outline`, `body.expand`, `body.improve`). Short targets return single JSON objects; body targets stream newline-delimited JSON (`application/x-ndjson`).",
        tags: ["Blog - Admin"],
        security: [{ cookieAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/AiGenerateRequest" },
            },
          },
        },
        responses: {
          200: {
            description: "AI generation response (JSON or application/x-ndjson stream)",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    status: { type: "string", example: "ok" },
                    value: { description: "Generated text or tags array", oneOf: [{ type: "string" }, { type: "array", items: { type: "string" } }] },
                    warnings: { type: "array", items: { type: "string" } },
                    remaining: { type: "object" },
                  },
                },
              },
              "application/x-ndjson": {
                schema: {
                  type: "string",
                  description: "Stream of newline-delimited JSON events: {type:'chunk',text:'...'} followed by {type:'done',...}",
                },
              },
            },
          },
          401: {
            description: "Unauthorized",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
          413: {
            description: "Post content exceeds payload limit (2MB)",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
          429: {
            description: "AI rate limit or daily quota exceeded",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    error: { type: "string" },
                    code: { type: "string", example: "RATE_LIMIT" },
                    retryAfter: { type: "integer", nullable: true },
                  },
                },
              },
            },
          },
        },
      },
    },

    "/api/admin/blog/ai/status": {
      get: {
        operationId: "getAiStatus",
        summary: "Check AI service status and quota",
        description: "Admin-only. Reports whether AI service is configured (e.g., NVIDIA NIM / OpenAI), active model name, and remaining requests in the quota window.",
        tags: ["Blog - Admin"],
        security: [{ cookieAuth: [] }],
        responses: {
          200: {
            description: "AI service status",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    configured: { type: "boolean", example: true },
                    model: { type: "string", example: "meta/llama-3.1-70b-instruct" },
                    remaining: {
                      type: "object",
                      properties: {
                        day: { type: "integer", example: 45 },
                        minute: { type: "integer", example: 10 },
                      },
                    },
                  },
                },
              },
            },
          },
          401: {
            description: "Unauthorized",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
        },
      },
    },

    // -------------------------------------------------------------------------
    // BLOG - PUBLIC
    // -------------------------------------------------------------------------
    "/api/blog/views": {
      get: {
        operationId: "getBlogViews",
        summary: "Get view count for single post or all posts",
        description: "Public endpoint. When `slug` query parameter is provided, returns view count for that post. When omitted, returns total views across all published posts and a slug-to-views map.",
        tags: ["Blog - Public"],
        parameters: [
          {
            name: "slug",
            in: "query",
            required: false,
            schema: { type: "string" },
            description: "Optional blog post slug",
            example: "whisper-bangla-guarded-fine-tuning",
          },
        ],
        responses: {
          200: {
            description: "View count data",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    success: { type: "boolean", example: true },
                    slug: { type: "string", example: "whisper-bangla-guarded-fine-tuning" },
                    views: { type: "integer", example: 342 },
                    totalViews: { type: "integer", example: 1250 },
                    postViews: {
                      type: "object",
                      additionalProperties: { type: "integer" },
                      example: { "whisper-bangla-guarded-fine-tuning": 342 },
                    },
                  },
                },
              },
            },
          },
          404: {
            description: "Post not found",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
          500: {
            description: "Server error",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
        },
      },
      post: {
        operationId: "incrementBlogViews",
        summary: "Increment view count for a blog post",
        description: "Public endpoint called when a reader opens a post. Atomically increments post view count and registers visitor record. Authenticated admin views are ignored to avoid inflating numbers.",
        tags: ["Blog - Public"],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["slug"],
                properties: {
                  slug: {
                    type: "string",
                    description: "Blog post slug",
                    example: "whisper-bangla-guarded-fine-tuning",
                  },
                },
              },
            },
          },
        },
        responses: {
          200: {
            description: "View recorded or ignored if admin",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    success: { type: "boolean", example: true },
                    slug: { type: "string", example: "whisper-bangla-guarded-fine-tuning" },
                    views: { type: "integer", example: 343 },
                    ignored: { type: "string", enum: ["admin_session"], example: "admin_session" },
                  },
                },
              },
            },
          },
          400: {
            description: "Missing slug",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
          404: {
            description: "Post not found",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
          500: {
            description: "Server error",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
        },
      },
    },

    // -------------------------------------------------------------------------
    // ANALYTICS & TELEMETRY
    // -------------------------------------------------------------------------
    "/api/analytics": {
      get: {
        operationId: "getAnalyticsDashboard",
        summary: "Get comprehensive analytics dashboard data",
        description:
          "Admin-only. Aggregates metrics for the specified time range (default: 14 days), including total counts, mouse/keyboard event counts, top pages with dwell time and scroll depths, device breakdown, browser share, countries, component interaction hotspots, hourly traffic, and session statistics.",
        tags: ["Analytics & Telemetry"],
        security: [{ cookieAuth: [] }],
        parameters: [
          {
            name: "days",
            in: "query",
            required: false,
            schema: { type: "integer", default: 14 },
            description: "Lookback period in days",
          },
        ],
        responses: {
          200: {
            description: "Analytics dashboard metrics",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/AnalyticsDashboardData" },
              },
            },
          },
          401: {
            description: "Unauthorized",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
          500: {
            description: "Server error fetching analytics",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
        },
      },
    },

    "/api/analytics/track": {
      post: {
        operationId: "trackAnalyticsRecord",
        summary: "Track visitor session interaction telemetry",
        description: "Public telemetry endpoint. Receives comprehensive client session metrics (dwell time, clicks, scroll depth, components interacted, mouse movement trajectory, idle periods), extracts server-side IP/geolocation, sanitizes payload, and saves to MongoDB.",
        tags: ["Analytics & Telemetry"],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/AnalyticsRecordInput" },
            },
          },
        },
        responses: {
          200: {
            description: "Analytics record saved",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    success: { type: "boolean", example: true },
                  },
                },
              },
            },
          },
          500: {
            description: "Failed to record analytics",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
        },
      },
      get: {
        operationId: "getTrackEndpointInfo",
        summary: "Analytics tracking endpoint info",
        description: "Returns instruction message for POST usage.",
        tags: ["Analytics & Telemetry"],
        responses: {
          200: {
            description: "Endpoint description",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    message: { type: "string" },
                    method: { type: "string" },
                  },
                },
              },
            },
          },
        },
      },
    },

    "/api/analytics/batch": {
      post: {
        operationId: "ingestAnalyticsBatch",
        summary: "Batch ingest analytics interaction events",
        description: "Public batch ingestion endpoint (up to 100 events per request). Attaches session context, IP geolocation, and User-Agent. Ignores authenticated admin events.",
        tags: ["Analytics & Telemetry"],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["events"],
                properties: {
                  sessionId: { type: "string", example: "sess_1729000000_abc" },
                  page: { type: "string", example: "/blog/whisper-bangla" },
                  deviceContext: { type: "object" },
                  events: {
                    type: "array",
                    maxItems: 100,
                    items: { $ref: "#/components/schemas/AnalyticsEvent" },
                  },
                },
              },
            },
          },
        },
        responses: {
          200: {
            description: "Batch events ingested",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    success: { type: "boolean", example: true },
                    insertedCount: { type: "integer", example: 15 },
                    ignored: { type: "string", example: "authenticated_user" },
                  },
                },
              },
            },
          },
          500: {
            description: "Failed to process batch",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
        },
      },
      get: {
        operationId: "getBatchEndpointInfo",
        summary: "Analytics batch ingestion format info",
        description: "Returns schema structure, required method (POST), and payload guidelines for batch analytics event ingestion.",
        tags: ["Analytics & Telemetry"],
        responses: {
          200: {
            description: "Batch endpoint description",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    endpoint: { type: "string" },
                    method: { type: "string" },
                    format: { type: "string" },
                  },
                },
              },
            },
          },
        },
      },
    },

    "/api/analytics/events": {
      post: {
        operationId: "ingestAnalyticsEvents",
        summary: "Ingest single or array of events",
        description: "Public telemetry endpoint. Accepts a single event object or array of events (up to 100). Ignored for admin users.",
        tags: ["Analytics & Telemetry"],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                oneOf: [
                  { $ref: "#/components/schemas/AnalyticsEvent" },
                  { type: "array", maxItems: 100, items: { $ref: "#/components/schemas/AnalyticsEvent" } },
                  {
                    type: "object",
                    required: ["events"],
                    properties: {
                      events: { type: "array", maxItems: 100, items: { $ref: "#/components/schemas/AnalyticsEvent" } },
                    },
                  },
                ],
              },
            },
          },
        },
        responses: {
          200: {
            description: "Events saved",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    success: { type: "boolean", example: true },
                    insertedCount: { type: "integer", example: 1 },
                    ignored: { type: "string", example: "authenticated_user" },
                  },
                },
              },
            },
          },
          500: {
            description: "Event processing failed",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
        },
      },
      get: {
        operationId: "getEventsEndpointInfo",
        summary: "Analytics events endpoint info",
        description: "Returns schema documentation and accepted formats (single object, array, or wrapped events object) for telemetry ingestion.",
        tags: ["Analytics & Telemetry"],
        responses: {
          200: {
            description: "Events format info",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    endpoint: { type: "string" },
                    method: { type: "string" },
                    format: { type: "string" },
                  },
                },
              },
            },
          },
        },
      },
    },

    "/api/analytics/heatmap": {
      get: {
        operationId: "getHeatmapPoints",
        summary: "Get visual heatmap points",
        description: "Admin-only. Computes coordinate heatmap points for the selected interaction mode (`click`, `hover`, `movement`, `scroll`) and time window.",
        tags: ["Analytics & Telemetry"],
        security: [{ cookieAuth: [] }],
        parameters: [
          {
            name: "mode",
            in: "query",
            required: false,
            schema: { type: "string", enum: ["click", "hover", "movement", "scroll"], default: "click" },
            description: "Interaction mode for heatmap",
          },
          {
            name: "days",
            in: "query",
            required: false,
            schema: { type: "integer", default: 14 },
            description: "Days range",
          },
        ],
        responses: {
          200: {
            description: "Heatmap coordinate dataset",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    success: { type: "boolean", example: true },
                    mode: { type: "string", example: "click" },
                    points: {
                      type: "array",
                      items: {
                        type: "object",
                        properties: {
                          x: { type: "number", example: 450 },
                          y: { type: "number", example: 820 },
                          value: { type: "number", example: 5 },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
          401: {
            description: "Unauthorized",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
          500: {
            description: "Failed to fetch heatmap data",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
        },
      },
    },

    "/api/analytics/live": {
      get: {
        operationId: "getLiveSessions",
        summary: "Get real-time active visitors",
        description: "Admin-only. Lists visitors active within the last N minutes (default: 5 minutes) with current page, duration, and geographic location.",
        tags: ["Analytics & Telemetry"],
        security: [{ cookieAuth: [] }],
        parameters: [
          {
            name: "window",
            in: "query",
            required: false,
            schema: { type: "integer", default: 5 },
            description: "Active window duration in minutes",
          },
        ],
        responses: {
          200: {
            description: "Live visitors data",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    success: { type: "boolean", example: true },
                    count: { type: "integer", example: 3 },
                    liveVisitors: {
                      type: "array",
                      items: { type: "object" },
                    },
                  },
                },
              },
            },
          },
          401: {
            description: "Unauthorized",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
          500: {
            description: "Server error",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
        },
      },
    },

    "/api/analytics/sessions": {
      get: {
        operationId: "listAnalyticsSessions",
        summary: "List visitor browsing sessions",
        description: "Admin-only. Retrieves list of browsing sessions in the time range with total page views, dwell duration, and device metadata.",
        tags: ["Analytics & Telemetry"],
        security: [{ cookieAuth: [] }],
        parameters: [
          {
            name: "days",
            in: "query",
            required: false,
            schema: { type: "integer", default: 14 },
          },
          {
            name: "limit",
            in: "query",
            required: false,
            schema: { type: "integer", default: 30 },
          },
        ],
        responses: {
          200: {
            description: "List of sessions",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    success: { type: "boolean", example: true },
                    sessions: {
                      type: "array",
                      items: { type: "object" },
                    },
                  },
                },
              },
            },
          },
          401: {
            description: "Unauthorized",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
          500: {
            description: "Server error",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
        },
      },
    },

    "/api/analytics/sessions/{id}/replay": {
      get: {
        operationId: "getSessionReplay",
        summary: "Get session replay interaction timeline",
        description: "Admin-only. Reconstructs all client-side mouse coordinates, clicks, scrolls, keystrokes, and URL transitions for an individual session for visual replay.",
        tags: ["Analytics & Telemetry"],
        security: [{ cookieAuth: [] }],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "string" },
            description: "Session identifier",
            example: "sess_1729000000_abc123",
          },
        ],
        responses: {
          200: {
            description: "Session replay timeline dataset",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    success: { type: "boolean", example: true },
                    sessionId: { type: "string" },
                    events: { type: "array", items: { type: "object" } },
                  },
                },
              },
            },
          },
          400: {
            description: "Missing session ID",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
          401: {
            description: "Unauthorized",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
          404: {
            description: "Session replay data not found",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
          500: {
            description: "Server error",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
        },
      },
    },

    // -------------------------------------------------------------------------
    // VISITORS
    // -------------------------------------------------------------------------
    "/api/visitors": {
      post: {
        operationId: "trackVisitor",
        summary: "Record visitor page hit beacon",
        description: "Public beacon endpoint. Saves page URL, userAgent, IP, screen resolution, timezone, language, and referrer into the Visitor log.",
        tags: ["Visitors"],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/VisitorBeaconInput" },
            },
          },
        },
        responses: {
          200: {
            description: "Visitor logged",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    success: { type: "boolean", example: true },
                  },
                },
              },
            },
          },
          500: {
            description: "Failed to record visitor",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
        },
      },
      get: {
        operationId: "getVisitorStats",
        summary: "Get aggregated visitor demographic statistics",
        description: "Admin-only. Computes overall counts (total, today, week, month), top pages, platform (macOS, Windows, Linux, Android), browsers, countries, languages, resolutions, traffic sources, and recent visit timestamps.",
        tags: ["Visitors"],
        security: [{ cookieAuth: [] }],
        responses: {
          200: {
            description: "Aggregated visitor statistics",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/VisitorStatsResponse" },
              },
            },
          },
          401: {
            description: "Unauthorized",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
          500: {
            description: "Failed to fetch stats",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
        },
      },
    },

    // -------------------------------------------------------------------------
    // RESUME & CV
    // -------------------------------------------------------------------------
    "/api/cv": {
      get: {
        operationId: "getCvJson",
        summary: "Get structured CV data as JSON",
        description:
          "Returns CV-shaped JSON assembled from live portfolio MongoDB collections (`Skills`, `Projects`, `Education`, `Experience`, `Contact`, `profile`). Lightweight and efficient for 1GB RAM servers; rendered by client browser into print-ready CV.",
        tags: ["Resume & CV"],
        responses: {
          200: {
            description: "Structured CV document",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/CvDocument" },
              },
            },
          },
          500: {
            description: "Failed to build CV data",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
        },
      },
    },

    "/api/resume": {
      get: {
        operationId: "downloadResumePdf",
        summary: "Download resume as PDF binary stream",
        description: "Serves either static PDF from public storage or dynamically generated jsPDF binary according to `RESUME_MODE` configuration.",
        tags: ["Resume & CV"],
        responses: {
          200: {
            description: "Resume PDF file binary stream",
            content: {
              "application/pdf": {
                schema: {
                  type: "string",
                  format: "binary",
                },
              },
            },
          },
          404: {
            description: "Static resume file not found",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
          500: {
            description: "Failed to generate resume",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
        },
      },
      post: {
        operationId: "downloadResumePdfPost",
        summary: "Download resume as PDF (POST alias)",
        description: "Identical to GET /api/resume for clients requiring POST form trigger.",
        tags: ["Resume & CV"],
        responses: {
          200: {
            description: "Resume PDF file stream",
            content: {
              "application/pdf": {
                schema: {
                  type: "string",
                  format: "binary",
                },
              },
            },
          },
        },
      },
    },

    // -------------------------------------------------------------------------
    // FILE UPLOADS
    // -------------------------------------------------------------------------
    "/api/upload-image": {
      post: {
        operationId: "uploadPortfolioImage",
        summary: "Upload image with SEO metadata for portfolio sections",
        description:
          "Admin-only. Accepts multipart form data with image file (JPG, PNG, GIF, WebP, max 2MB limit), target `collectionName` (default 'profile'), and `documentId`. Converts image to base64 data URL, embeds complete SEO metadata, and updates MongoDB document.",
        tags: ["Media & Uploads"],
        security: [{ cookieAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "multipart/form-data": {
              schema: {
                type: "object",
                required: ["image"],
                properties: {
                  image: {
                    type: "string",
                    format: "binary",
                    description: "Image file binary (max 2MB)",
                  },
                  collectionName: {
                    type: "string",
                    default: "profile",
                    description: "Collection name to update",
                  },
                  documentId: {
                    type: "string",
                    default: "profile",
                    description: "Item ID within collection",
                  },
                },
              },
            },
          },
        },
        responses: {
          200: {
            description: "Image successfully uploaded and updated",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    success: { type: "boolean", example: true },
                    image: { type: "string", description: "Base64 data URI" },
                    imageMetadata: { type: "object" },
                    message: { type: "string", example: "Image uploaded successfully with comprehensive SEO metadata" },
                  },
                },
              },
            },
          },
          400: {
            description: "No file provided, invalid type, or file larger than 2MB",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
          401: {
            description: "Unauthorized",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
          500: {
            description: "Failed to upload image",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
        },
      },
    },
  },

  // ---------------------------------------------------------------------------
  // COMPONENTS / SCHEMAS & SECURITY
  // ---------------------------------------------------------------------------
  components: {
    securitySchemes: {
      cookieAuth: {
        type: "apiKey",
        in: "cookie",
        name: "admin_session",
        description:
          "HTTP-only cookie `admin_session` in development, or `__Host-mahbub_admin` in production, issued by `POST /api/auth/login`. Non-GET requests also require a matching `Origin` header.",
      },
    },
    schemas: {
      ErrorResponse: {
        type: "object",
        properties: {
          success: { type: "boolean", example: false },
          error: { type: "string", example: "Authentication required" },
        },
      },
      AuthErrorResponse: {
        type: "object",
        properties: {
          success: { type: "boolean", example: false },
          message: { type: "string", example: "Invalid credentials" },
        },
      },
      LoginAttempt: {
        type: "object",
        properties: {
          username: { type: "string", example: "mahbub" },
          timestamp: { type: "string", format: "date-time" },
          userAgent: { type: "string", example: "Mozilla/5.0..." },
          ip: { type: "string", example: "103.14.24.1" },
          success: { type: "boolean", example: true },
          createdAt: { type: "string", format: "date-time" },
        },
      },
      ContactMessage: {
        type: "object",
        properties: {
          id: { type: "string", example: "670c1d2e3f4a5b6c7d8e9f01" },
          name: { type: "string", example: "John Doe" },
          email: { type: "string", format: "email", example: "john@example.com" },
          subject: { type: "string", example: "Consulting Inquiry" },
          message: { type: "string", example: "Hello Mahbub..." },
          ip: { type: "string", example: "103.14.24.1" },
          userAgent: { type: "string" },
          status: { type: "string", enum: ["pending", "sent", "saved_locally", "failed"], example: "sent" },
          emailError: { type: "string", nullable: true },
          createdAt: { type: "string", format: "date-time" },
          updatedAt: { type: "string", format: "date-time" },
        },
      },
      ImageVariant: {
        type: "object",
        required: ["width", "height", "src"],
        properties: {
          width: { type: "integer", example: 1280 },
          height: { type: "integer", example: 720 },
          src: { type: "string", example: "/uploads/blog/arch-1280w.webp" },
        },
      },
      ImageRef: {
        type: "object",
        required: ["src", "width", "height"],
        properties: {
          mediaId: { type: "string", example: "670c1d2e3f4a5b6c7d8e9f03" },
          src: { type: "string", example: "/uploads/blog/arch.webp" },
          variants: {
            type: "array",
            items: { $ref: "#/components/schemas/ImageVariant" },
          },
          width: { type: "integer", example: 1920 },
          height: { type: "integer", example: 1080 },
          alt: { type: "string", example: "Diagram of system microservices" },
          caption: { type: "string", example: "High level architecture" },
          ogSrc: { type: "string", nullable: true, example: "/uploads/blog/arch-og.webp" },
        },
      },
      BlogMediaItem: {
        type: "object",
        properties: {
          mediaId: { type: "string", example: "670c1d2e3f4a5b6c7d8e9f03" },
          src: { type: "string", example: "/uploads/blog/arch.webp" },
          width: { type: "integer", example: 1920 },
          height: { type: "integer", example: 1080 },
          alt: { type: "string" },
          name: { type: "string", example: "architecture-v2.png" },
          createdAt: { type: "string", format: "date-time" },
          variants: {
            type: "array",
            items: { $ref: "#/components/schemas/ImageVariant" },
          },
        },
      },
      BlogPostSummary: {
        type: "object",
        properties: {
          id: { type: "string", example: "670c1d2e3f4a5b6c7d8e9f02" },
          title: { type: "string", example: "Building MCP Servers with Next.js" },
          slug: { type: "string", example: "building-mcp-servers-nextjs" },
          status: { type: "string", enum: ["draft", "scheduled", "published"], example: "published" },
          publishedAt: { type: "string", format: "date-time", nullable: true },
          updatedAt: { type: "string", format: "date-time" },
          views: { type: "integer", example: 420 },
          tags: { type: "array", items: { type: "string" }, example: ["MCP", "AI", "Node.js"] },
        },
      },
      BlogPost: {
        type: "object",
        properties: {
          id: { type: "string", example: "670c1d2e3f4a5b6c7d8e9f02" },
          version: { type: "integer", description: "Optimistic concurrency version number", example: 4 },
          title: { type: "string", example: "Building MCP Servers with Next.js" },
          slug: { type: "string", example: "building-mcp-servers-nextjs" },
          status: { type: "string", enum: ["draft", "scheduled", "published"], example: "published" },
          excerpt: { type: "string", example: "Learn how to build Model Context Protocol tools..." },
          metaTitle: { type: "string", example: "Building MCP Servers with Next.js | Mahbub Alam" },
          metaDescription: { type: "string", example: "A guide on integrating Next.js APIs with Model Context Protocol." },
          canonicalUrl: { type: "string", nullable: true },
          coverImage: { $ref: "#/components/schemas/ImageRef" },
          tags: { type: "array", items: { type: "string" } },
          bodyFont: { type: "string", enum: ["sans", "serif"], example: "sans" },
          contentJson: {
            type: "object",
            description: "Tiptap ProseMirror document schema",
            properties: {
              type: { type: "string", example: "doc" },
              content: { type: "array", items: { type: "object" } },
            },
          },
          publishedAt: { type: "string", format: "date-time", nullable: true },
          createdAt: { type: "string", format: "date-time" },
          updatedAt: { type: "string", format: "date-time" },
          views: { type: "integer", example: 420 },
        },
      },
      BlogPostPatch: {
        type: "object",
        required: ["version"],
        properties: {
          version: { type: "integer", description: "Must match the post's current server version", example: 3 },
          title: { type: "string", maxLength: 200, example: "Building MCP Servers with Next.js" },
          slug: { type: "string", maxLength: 80, example: "building-mcp-servers-nextjs" },
          autoSlug: { type: "boolean", description: "If true, auto-generates slug and suffixes on collision" },
          excerpt: { type: "string", maxLength: 300 },
          metaTitle: { type: "string", maxLength: 140 },
          metaDescription: { type: "string", maxLength: 320 },
          canonicalUrl: { type: "string", nullable: true },
          coverImage: { $ref: "#/components/schemas/ImageRef" },
          tags: { type: "array", maxItems: 10, items: { type: "string", maxLength: 40 } },
          bodyFont: { type: "string", enum: ["sans", "serif"] },
          contentJson: {
            type: "object",
            properties: {
              type: { type: "string", example: "doc" },
              content: { type: "array", items: { type: "object" } },
            },
          },
        },
      },
      AiGenerateRequest: {
        type: "object",
        required: ["target"],
        properties: {
          target: {
            type: "string",
            enum: [
              "title",
              "excerpt",
              "metaTitle",
              "metaDescription",
              "slug",
              "tags",
              "coverAlt",
              "imageAlt",
              "body.outline",
              "body.expand",
              "body.improve",
            ],
            description: "Target field or body generator action",
            example: "metaDescription",
          },
          fields: {
            type: "object",
            properties: {
              title: { type: "string" },
              excerpt: { type: "string" },
              slug: { type: "string" },
              tags: { type: "array", items: { type: "string" } },
              metaTitle: { type: "string" },
              metaDescription: { type: "string" },
              coverAlt: { type: "string" },
              coverCaption: { type: "string" },
              contentJson: { type: "object" },
            },
          },
          selection: { type: "string", description: "Selected text in editor for expand or improve actions" },
          nearbyText: { type: "string", description: "Text context surrounding the cursor or image" },
          image: {
            type: "object",
            properties: {
              caption: { type: "string" },
              nearbyText: { type: "string" },
            },
          },
          fresh: { type: "boolean", description: "Bypass response cache for generation", default: false },
        },
      },
      AnalyticsRecordInput: {
        type: "object",
        properties: {
          page: { type: "string", example: "/" },
          sessionId: { type: "string", example: "sess_1729000000_abc" },
          userAgent: { type: "string", example: "Mozilla/5.0..." },
          referrer: { type: "string", example: "https://github.com/mahbub96" },
          screenResolution: { type: "string", example: "1920x1080" },
          timeOnPage: { type: "number", description: "Dwell time in seconds", example: 45.2 },
          activeTime: { type: "number", description: "Active interaction seconds", example: 38.0 },
          maxScrollDepth: { type: "number", description: "Max scroll percentage (0-100)", example: 85 },
          totalClicksOnPage: { type: "integer", example: 7 },
          totalKeypressesOnPage: { type: "integer", example: 12 },
          componentsInteracted: {
            type: "array",
            items: {
              type: "object",
              properties: {
                component: { type: "string", example: "ProjectCard_BanglaASR" },
                interactionType: { type: "string", example: "click" },
                timestamp: { type: "string", format: "date-time" },
              },
            },
          },
          clickPositions: {
            type: "array",
            items: {
              type: "object",
              properties: {
                x: { type: "number", example: 420 },
                y: { type: "number", example: 750 },
                target: { type: "string", example: "a.btn-primary" },
              },
            },
          },
          mousePositions: {
            type: "array",
            items: {
              type: "object",
              properties: {
                x: { type: "number" },
                y: { type: "number" },
                t: { type: "number" },
              },
            },
          },
          idlePeriods: {
            type: "array",
            items: {
              type: "object",
              properties: {
                start: { type: "number" },
                duration: { type: "number" },
              },
            },
          },
        },
      },
      AnalyticsEvent: {
        type: "object",
        required: ["type"],
        properties: {
          type: { type: "string", example: "click", description: "Event type: click, scroll, hover, input, view" },
          sessionId: { type: "string", example: "sess_1729000000_abc" },
          page: { type: "string", example: "/" },
          target: { type: "string", example: "button#contact-submit" },
          timestamp: { type: "string", format: "date-time" },
          data: { type: "object", description: "Additional event properties (e.g. scrollDepth, coords)" },
        },
      },
      AnalyticsDashboardData: {
        type: "object",
        properties: {
          summary: {
            type: "object",
            properties: {
              totalRecords: { type: "integer", example: 1540 },
              totalEvents: { type: "integer", example: 18200 },
              todayRecords: { type: "integer", example: 120 },
            },
          },
          mouseEvents: { type: "integer", example: 12450 },
          keyboardEvents: { type: "integer", example: 3400 },
          pages: {
            type: "array",
            items: {
              type: "object",
              properties: {
                page: { type: "string", example: "/" },
                visits: { type: "integer", example: 820 },
                avgTimeOnPage: { type: "number", example: 48.5 },
                totalClicks: { type: "integer", example: 2100 },
                avgScrollDepth: { type: "number", example: 72.3 },
              },
            },
          },
          devices: { type: "array", items: { type: "object" } },
          browsers: {
            type: "array",
            items: {
              type: "object",
              properties: {
                browser: { type: "string", example: "Chrome" },
                count: { type: "integer", example: 980 },
              },
            },
          },
          countries: { type: "array", items: { type: "object" } },
          components: {
            type: "array",
            items: {
              type: "object",
              properties: {
                component: { type: "string", example: "NavigationMenu" },
                interactions: { type: "integer", example: 450 },
              },
            },
          },
          hourly: { type: "array", items: { type: "object" } },
          daily: { type: "array", items: { type: "object" } },
          timeRange: {
            type: "object",
            properties: {
              days: { type: "integer", example: 14 },
              start: { type: "string", format: "date-time" },
              end: { type: "string", format: "date-time" },
            },
          },
          sessions: {
            type: "object",
            properties: {
              totalSessions: { type: "integer", example: 1100 },
              avgPagesPerSession: { type: "number", example: 2.4 },
              avgSessionDuration: { type: "number", example: 92.1 },
            },
          },
          recent: { type: "array", items: { type: "object" } },
        },
      },
      VisitorBeaconInput: {
        type: "object",
        properties: {
          ip: { type: "string", example: "103.14.24.1" },
          userAgent: { type: "string", example: "Mozilla/5.0..." },
          page: { type: "string", example: "/" },
          country: { type: "string", example: "Bangladesh" },
          city: { type: "string", example: "Dhaka" },
          region: { type: "string", example: "Dhaka Division" },
          timezone: { type: "string", example: "Asia/Dhaka" },
          referrer: { type: "string", example: "direct" },
          screenResolution: { type: "string", example: "1920x1080" },
          language: { type: "string", example: "en-US" },
        },
      },
      VisitorStatsResponse: {
        type: "object",
        properties: {
          totalVisitors: { type: "integer", example: 4500 },
          todayVisitors: { type: "integer", example: 130 },
          thisWeekVisitors: { type: "integer", example: 840 },
          thisMonthVisitors: { type: "integer", example: 3100 },
          pageStats: { type: "array", items: { type: "object" } },
          deviceStats: { type: "array", items: { type: "object" } },
          countryStats: { type: "array", items: { type: "object" } },
          browserStats: { type: "array", items: { type: "object" } },
          languageStats: { type: "array", items: { type: "object" } },
          screenStats: { type: "array", items: { type: "object" } },
          trafficStats: { type: "array", items: { type: "object" } },
          hourlyStats: { type: "array", items: { type: "object" } },
          dailyStats: { type: "array", items: { type: "object" } },
          monthlyStats: { type: "array", items: { type: "object" } },
          recentVisits: { type: "array", items: { type: "object" } },
        },
      },
      CvDocument: {
        type: "object",
        properties: {
          profile: {
            type: "object",
            properties: {
              name: { type: "string", example: "Mahbub Alam" },
              title: { type: "string", example: "Full Stack Software Engineer" },
              email: { type: "string", example: "mahbubcse96@gmail.com" },
              location: { type: "string", example: "Dhaka, Bangladesh" },
              github: { type: "string", example: "https://github.com/mahbub96" },
              linkedin: { type: "string", example: "https://linkedin.com/in/md-mahbub-alam-6b751821b" },
            },
          },
          summary: { type: "string" },
          skills: { type: "array", items: { type: "object" } },
          experience: { type: "array", items: { type: "object" } },
          projects: { type: "array", items: { type: "object" } },
          education: { type: "array", items: { type: "object" } },
          lastUpdate: { type: "string", format: "date-time", nullable: true },
        },
      },
    },
  },
};

// Output file paths
const jsonPath = path.join(rootDir, "public", "openapi.json");
const yamlPath = path.join(rootDir, "openapi.yaml");

// Ensure public directory exists
mkdirSync(path.join(rootDir, "public"), { recursive: true });

// 1. Write formatted JSON
const jsonContent = JSON.stringify(spec, null, 2);
writeFileSync(jsonPath, jsonContent, "utf8");
console.log(`[OK] Generated JSON OpenAPI spec: ${jsonPath} (${(jsonContent.length / 1024).toFixed(1)} KB)`);

// 2. Write YAML
const yamlContent = yaml.dump(spec, {
  indent: 2,
  lineWidth: -1,
  noRefs: true,
  quotingType: '"',
});
writeFileSync(yamlPath, yamlContent, "utf8");
console.log(`[OK] Generated YAML OpenAPI spec: ${yamlPath} (${(yamlContent.length / 1024).toFixed(1)} KB)`);
