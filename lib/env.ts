import { z } from "zod";

const envSchema = z.object({
  NEXT_PUBLIC_BASE_URL: z.url(),
  // Add other environment variables here
});

export const env = envSchema.parse({
  NEXT_PUBLIC_BASE_URL: process.env.NEXT_PUBLIC_BASE_URL,
});

export type Env = z.infer<typeof envSchema>;
