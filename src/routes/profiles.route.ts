import { z } from "zod";
import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import {
  createProfileController,
  deleteProfileController,
  getProfileByIdController,
  listProfilesController,
} from "../controllers/profile.controller";

const profileIdParamSchema = z.object({
  id: z.string().uuid("Invalid profile id"),
});

const profileBodySchema = z.object({
  name: z.string().trim().min(1, "Name is required"),
});

const listProfilesQuerySchema = z.object({
  gender: z.enum(["male", "female"]).optional(),
  country_id: z.string().trim().toUpperCase().length(2).optional(),
  age_group: z.enum(["child", "teenager", "adult", "senior"]).optional(),
  min_age: z.coerce.number().int().min(0).max(150).optional(),
  max_age: z.coerce.number().int().min(0).max(150).optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).default(10),
  sort_by: z
    .enum(["created_at", "age", "gender_probability"])
    .default("created_at"),
  order: z.enum(["asc", "desc"]).default("desc"),
  q: z.string().trim().min(1).optional(),
});

export const profilesRoute = new Hono()
  .post(
    "/",
    zValidator("json", profileBodySchema, (result, c) => {
      if (!result.success) {
        return c.json(
          {
            status: "error",
            message: "Invalid request body",
          },
          422,
        );
      }
    }),
    createProfileController,
  )
  .get(
    "/",
    zValidator("query", listProfilesQuerySchema, (result, c) => {
      if (!result.success) {
        return c.json(
          {
            status: "error",
            message: "Invalid query parameters",
          },
          400,
        );
      }
    }),
    listProfilesController,
  )
  .get(
    "/:id",
    zValidator("param", profileIdParamSchema, (result, c) => {
      if (!result.success) {
        return c.json(
          {
            status: "error",
            message: "Invalid profile id",
          },
          400,
        );
      }
    }),
    getProfileByIdController,
  )
  .delete(
    "/:id",
    zValidator("param", profileIdParamSchema, (result, c) => {
      if (!result.success) {
        return c.json(
          {
            status: "error",
            message: "Invalid profile id",
          },
          400,
        );
      }
    }),
    deleteProfileController,
  );

export type ProfilesQuery = z.infer<typeof listProfilesQuerySchema>;
export type ProfileIdParam = z.infer<typeof profileIdParamSchema>;
export type ProfileBody = z.infer<typeof profileBodySchema>;
