import { z } from "zod";

export const GoogleUserSchema = z.object({
    email: z.string().email(),
    sub: z.string(),
    name: z.string(),
    picture: z.string().url().optional(),
    email_verified: z.boolean().optional()
});

export type GoogleUser = z.infer<typeof GoogleUserSchema>;