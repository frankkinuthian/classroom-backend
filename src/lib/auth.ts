import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";

import { db } from "../db/index.js"; // your drizzle instance
import * as schema from "../db/schema/auth.js";

const isProduction = process.env.NODE_ENV === "production";
const trustedOrigins = [
  process.env.FRONTEND_URL,
  ...(process.env.FRONTEND_URLS ?? "")
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean),
].filter(Boolean) as string[];

export const auth = betterAuth({
  secret: process.env.BETTER_AUTH_SECRET!,
  baseURL: process.env.BETTER_AUTH_URL,
  trustedOrigins,
  advanced: {
    cookies: {
      session_token: {
        attributes: {
          sameSite: isProduction ? "none" : "lax",
          secure: isProduction,
          httpOnly: true,
          path: "/",
        },
      },
      session_data: {
        attributes: {
          sameSite: isProduction ? "none" : "lax",
          secure: isProduction,
          httpOnly: true,
          path: "/",
        },
      },
    },
  },
  database: drizzleAdapter(db, {
    provider: "pg",
    schema,
  }),
  emailAndPassword: {
    enabled: true,
  },
  user: {
    additionalFields: {
      role: {
        type: "string",
        required: true,
        defaultValue: "student",
        input: true, // Allow role to be set during registration
      },
      imageCldPubId: {
        type: "string",
        required: false,
        input: true, // Allow imageCldPubId to be set during registration
      },
    },
  },
});
