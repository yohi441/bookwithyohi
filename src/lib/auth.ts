import { betterAuth } from "better-auth";
import { prismaAdapter } from "@better-auth/prisma-adapter";
import { nextCookies } from "better-auth/next-js";
import { getPrisma } from "./prisma";

export const auth = betterAuth({
  appName: "YohiSlot",
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
