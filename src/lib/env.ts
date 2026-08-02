import { z } from "zod";

const emptyStringToUndefined = (value: unknown) =>
  typeof value === "string" && value.trim() === "" ? undefined : value;

const serverEnvSchema = z.object({
  NEXT_PUBLIC_SITE_URL: z.preprocess(emptyStringToUndefined, z.string().url().optional()),
  NEXT_PUBLIC_CALENDLY_BOOKING_URL: z.preprocess(emptyStringToUndefined, z.string().url().optional()),
  NEXT_PUBLIC_SUPABASE_URL: z.preprocess(emptyStringToUndefined, z.string().url().optional()),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.preprocess(emptyStringToUndefined, z.string().min(1).optional()),
  NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: z.preprocess(emptyStringToUndefined, z.string().min(1).optional()),
  RESEND_API_KEY: z.preprocess(emptyStringToUndefined, z.string().min(1).optional()),
  RESEND_FROM_EMAIL: z.preprocess(emptyStringToUndefined, z.string().email().optional()),
});

export type AppEnv = z.infer<typeof serverEnvSchema>;

function resolveSupabaseKey(env: AppEnv) {
  return env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
}

export function getEnv(): AppEnv {
  console.log("[ENV RAW] process.env values:", {
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL ? `${process.env.NEXT_PUBLIC_SUPABASE_URL.substring(0, 30)}...` : "undefined",
    NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ? `${process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY.substring(0, 20)}...` : "undefined",
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? "SET" : "undefined",
    RESEND_API_KEY: process.env.RESEND_API_KEY ? "SET" : "undefined",
  });
  return serverEnvSchema.parse({
    NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL,
    NEXT_PUBLIC_CALENDLY_BOOKING_URL: process.env.NEXT_PUBLIC_CALENDLY_BOOKING_URL,
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
    RESEND_API_KEY: process.env.RESEND_API_KEY,
    RESEND_FROM_EMAIL: process.env.RESEND_FROM_EMAIL,
  });
}

export function getSupabasePublishableKey() {
  return resolveSupabaseKey(getEnv());
}

export function hasSupabaseConfig() {
  try {
    const env = getEnv();
    const isConfigured = Boolean(env.NEXT_PUBLIC_SUPABASE_URL && resolveSupabaseKey(env));
    console.log("[ENV DEBUG] hasSupabaseConfig check:", {
      NEXT_PUBLIC_SUPABASE_URL: env.NEXT_PUBLIC_SUPABASE_URL ? `"${env.NEXT_PUBLIC_SUPABASE_URL.substring(0, 20)}..."` : "MISSING",
      NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ? `"${env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY.substring(0, 20)}..."` : "MISSING",
      NEXT_PUBLIC_SUPABASE_ANON_KEY: env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? "SET" : "MISSING",
      isConfigured,
    });
    return isConfigured;
  } catch (error) {
    console.error("[ENV ERROR] hasSupabaseConfig failed:", error instanceof Error ? error.message : error);
    return false;
  }
}

export function hasEmailConfig() {
  const env = getEnv();
  return Boolean(env.RESEND_API_KEY && env.RESEND_FROM_EMAIL);
}
