import { betterAuth } from "better-auth";
import { prismaAdapter } from "@better-auth/prisma-adapter";
import { nextCookies } from "better-auth/next-js";
import { getPrisma } from "./prisma";

export const auth = betterAuth({
  appName: "YohiSlot",
  baseURL: {
    allowedHosts: ["localhost:*", "127.0.0.1:*", "192.168.*.*:*", "*.vercel.app"],
    protocol: "auto",
    fallback: process.env.BETTER_AUTH_URL ?? "http://localhost:3000",
  },
  database: prismaAdapter(getPrisma(), { provider: "postgresql" }),
  emailAndPassword: { enabled: true },
  advanced: {
    database: { generateId: "serial" },
  },
  user: {
    additionalFields: {
      timezone: {
        type: "string",
        required: false,
        defaultValue: "Asia/Manila",
      },
    },
  },
  plugins: [nextCookies()],
});
