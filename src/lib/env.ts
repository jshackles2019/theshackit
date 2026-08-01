import { z } from "zod";

const serverEnvSchema = z.object({
  NEXT_PUBLIC_SITE_URL: z.string().url().optional(),
  NEXT_PUBLIC_CALENDLY_BOOKING_URL: z.string().url().optional(),
  NEXT_PUBLIC_SUPABASE_URL: z.string().url().optional(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1).optional(),
  RESEND_API_KEY: z.string().min(1).optional(),
  RESEND_FROM_EMAIL: z.string().email().optional(),
});

export type AppEnv = z.infer<typeof serverEnvSchema>;

export function getEnv(): AppEnv {
  return serverEnvSchema.parse({
    NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL,
    NEXT_PUBLIC_CALENDLY_BOOKING_URL: process.env.NEXT_PUBLIC_CALENDLY_BOOKING_URL,
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    RESEND_API_KEY: process.env.RESEND_API_KEY,
    RESEND_FROM_EMAIL: process.env.RESEND_FROM_EMAIL,
  });
}

export function hasSupabaseConfig() {
  const env = getEnv();
  return Boolean(env.NEXT_PUBLIC_SUPABASE_URL && env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
}

export function hasEmailConfig() {
  const env = getEnv();
  return Boolean(env.RESEND_API_KEY && env.RESEND_FROM_EMAIL);
}
