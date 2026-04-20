import { Hono } from "hono";
import { cors } from "hono/cors";
import {
  createProfileController,
  deleteProfileController,
  getProfileByIdController,
  listProfilesController,
} from "./controllers/profile.controller";

const app = new Hono();

app.use(
  "*",
  cors({
    origin: "*",
    allowMethods: ["GET", "POST", "DELETE", "OPTIONS"],
    allowHeaders: ["Content-Type"],
  }),
);

app.use("*", async (c, next) => {
  c.header("Access-Control-Allow-Origin", "*");
  await next();
});

app.get("/", (c) => {
  return c.json({
    status: "success",
    data: { message: "API is running" },
  });
});

app.post("/api/profiles", createProfileController);
app.get("/api/profiles/:id", getProfileByIdController);
app.get("/api/profiles", listProfilesController);
app.delete("/api/profiles/:id", deleteProfileController);

app.onError((err, c) => {
  console.error(err);
  return c.json(
    {
      status: "error",
      message: "Internal server error",
    },
    500,
  );
});

export default app;

export type AppType = typeof app;
