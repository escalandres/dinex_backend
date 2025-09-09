import { z } from "zod";

export const GithubUserSchema = z.object({
    id: z.number(),
    email: z.string().email().optional(), // GitHub puede devolver null o requerir scope extra
    login: z.string(),
    name: z.string().optional(),
    avatar_url: z.string().url().optional(),
    bio: z.string().optional(),
    company: z.string().optional(),
    location: z.string().optional()
});

export type GithubUser = z.infer<typeof GithubUserSchema>;