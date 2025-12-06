import { z } from "zod";

export const loginSchema = z.object({
  username: z
    .string()
    .min(1, "Username is required")
    .min(3, "Username must be at least 3 characters")
    .max(20, "Username must be at less than 20 characters"),
  password: z
    .string()
    .min(1, "Password is required")
    .min(6, "Password must be at least 8 characters")
    .max(9, "Password must be at less than 8 characters"),
});

//export the typescript for the schema
export type LoginFormData = z.infer<typeof loginSchema>;
