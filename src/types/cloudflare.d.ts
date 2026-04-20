/// <reference types="@cloudflare/workers-types" />

declare global {
  interface CloudflareEnv {
    DATABASE_URL: string;
    NODE_ENV?: "development" | "test" | "production";
  }
}

export {};
