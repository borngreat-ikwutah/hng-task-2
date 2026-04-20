import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const profiles = sqliteTable("profiles", {
  id: text("id").primaryKey(),
  name: text("name").notNull().unique(),

  gender: text("gender").notNull(),
  genderProbability: integer("gender_probability").notNull(),
  sampleSize: integer("sample_size").notNull(),

  age: integer("age").notNull(),
  ageGroup: text("age_group").notNull(),

  countryId: text("country_id").notNull(),
  countryProbability: integer("country_probability").notNull(),

  createdAt: text("created_at").notNull(),
});

export type Profile = typeof profiles.$inferSelect;
export type NewProfile = typeof profiles.$inferInsert;
