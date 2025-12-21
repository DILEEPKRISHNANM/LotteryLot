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
    .max(15, "Password must be at less than 12 characters"),
});

//export the typescript for the schema
export type LoginFormData = z.infer<typeof loginSchema>;

export const registerClientSchema = z.object({
  username: z
    .string()
    .min(1, "Email is required")
    .email("Please enter a valid email address"),
  password: z
    .string()
    .min(1, "Password is required")
    .min(6, "Password must be at least 6 characters")
    .max(12, "Password must be less than 12 characters"),
  displayText: z
    .string()
    .min(1, "Display text is required")
    .max(100, "Display text must be less than 100 characters")
    .optional(),
});

export type RegisterClientFormData = z.infer<typeof registerClientSchema>;
