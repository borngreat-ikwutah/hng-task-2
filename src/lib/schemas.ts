import { z } from "zod";

export const createProfileRequestSchema = z.object({
  name: z.string().trim().min(1, "Name is required"),
});

export const profileSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  gender: z.enum(["male", "female"]),
  gender_probability: z.number(),
  sample_size: z.number(),
  age: z.number(),
  age_group: z.enum(["child", "teenager", "adult", "senior"]),
  country_id: z.string(),
  country_probability: z.number(),
  created_at: z.string(),
});

export const profileListItemSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  gender: z.enum(["male", "female"]),
  age: z.number(),
  age_group: z.enum(["child", "teenager", "adult", "senior"]),
  country_id: z.string(),
});

export const successResponseSchema = z.object({
  status: z.literal("success"),
  data: z.unknown(),
});

export const errorResponseSchema = z.object({
  status: z.literal("error"),
  message: z.string(),
});

export type CreateProfileRequest = z.infer<typeof createProfileRequestSchema>;
export type Profile = z.infer<typeof profileSchema>;
export type ProfileListItem = z.infer<typeof profileListItemSchema>;
export type ErrorResponse = z.infer<typeof errorResponseSchema>;
