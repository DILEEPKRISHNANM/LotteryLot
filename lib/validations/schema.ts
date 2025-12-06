import { z } from "zod";

export const loginSchema = z.object({
  username: z
    .string()
    .min(1, "Email is required")
    .email("Invalid email address"),
  password: z
    .string()
    .min(1, "Password is required")
    .min(6, "Password must be at least 8 characters")
    .max(9, "Password must be at less than 8 characters"),
});

//export the typescript for the schema
export type LoginFormData = z.infer<typeof loginSchema>;
