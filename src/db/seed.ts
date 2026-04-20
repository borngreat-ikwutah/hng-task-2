import { drizzle } from "drizzle-orm/d1";
import type { AnyD1Database } from "drizzle-orm/d1";
import { createUuidV7 } from "../utils";
import { profiles } from "./schema";

type SeedProfile = Omit<typeof profiles.$inferInsert, "id" | "createdAt"> & {
  id?: string;
  createdAt?: string;
};

const seedProfiles: SeedProfile[] = [
  {
    name: "emmanuel",
    gender: "male",
    genderProbability: 99,
    sampleSize: 1200,
    age: 25,
    ageGroup: "adult",
    countryId: "NG",
    countryProbability: 84,
    createdAt: "2026-04-01T12:00:00.000Z",
  },
  {
    name: "sarah",
    gender: "female",
    genderProbability: 98,
    sampleSize: 1100,
    age: 28,
    ageGroup: "adult",
    countryId: "NG",
    countryProbability: 78,
    createdAt: "2026-04-02T12:00:00.000Z",
  },
  {
    name: "john",
    gender: "male",
    genderProbability: 97,
    sampleSize: 980,
    age: 33,
    ageGroup: "adult",
    countryId: "KE",
    countryProbability: 72,
    createdAt: "2026-04-03T12:00:00.000Z",
  },
  {
    name: "amina",
    gender: "female",
    genderProbability: 96,
    sampleSize: 1020,
    age: 18,
    ageGroup: "teenager",
    countryId: "TZ",
    countryProbability: 69,
    createdAt: "2026-04-04T12:00:00.000Z",
  },
  {
    name: "musa",
    gender: "male",
    genderProbability: 95,
    sampleSize: 890,
    age: 29,
    ageGroup: "adult",
    countryId: "GH",
    countryProbability: 74,
    createdAt: "2026-04-05T12:00:00.000Z",
  },
  {
    name: "grace",
    gender: "female",
    genderProbability: 94,
    sampleSize: 760,
    age: 22,
    ageGroup: "adult",
    countryId: "UG",
    countryProbability: 68,
    createdAt: "2026-04-06T12:00:00.000Z",
  },
  {
    name: "daniel",
    gender: "male",
    genderProbability: 93,
    sampleSize: 840,
    age: 41,
    ageGroup: "adult",
    countryId: "ZA",
    countryProbability: 65,
    createdAt: "2026-04-07T12:00:00.000Z",
  },
  {
    name: "faith",
    gender: "female",
    genderProbability: 92,
    sampleSize: 910,
    age: 24,
    ageGroup: "adult",
    countryId: "RW",
    countryProbability: 66,
    createdAt: "2026-04-08T12:00:00.000Z",
  },
  {
    name: "isaac",
    gender: "male",
    genderProbability: 91,
    sampleSize: 700,
    age: 19,
    ageGroup: "teenager",
    countryId: "CM",
    countryProbability: 60,
    createdAt: "2026-04-09T12:00:00.000Z",
  },
  {
    name: "tobi",
    gender: "male",
    genderProbability: 90,
    sampleSize: 680,
    age: 16,
    ageGroup: "teenager",
    countryId: "NG",
    countryProbability: 61,
    createdAt: "2026-04-10T12:00:00.000Z",
  },
  {
    name: "esther",
    gender: "female",
    genderProbability: 89,
    sampleSize: 640,
    age: 30,
    ageGroup: "adult",
    countryId: "KE",
    countryProbability: 58,
    createdAt: "2026-04-11T12:00:00.000Z",
  },
  {
    name: "samuel",
    gender: "male",
    genderProbability: 88,
    sampleSize: 620,
    age: 36,
    ageGroup: "adult",
    countryId: "GH",
    countryProbability: 57,
    createdAt: "2026-04-12T12:00:00.000Z",
  },
];

function getDatabase() {
  const database = (
    globalThis as typeof globalThis & {
      DB?: AnyD1Database;
    }
  ).DB;

  if (!database) {
    throw new Error(
      "No D1 binding found. Run the seed with Wrangler (local or remote) so the DB binding is available.",
    );
  }

  return drizzle(database, {
    schema: {
      profiles,
    },
  });
}

async function upsertSeedProfile(
  db: ReturnType<typeof drizzle>,
  profile: SeedProfile,
) {
  const id = profile.id ?? createUuidV7();
  const createdAt = profile.createdAt ?? new Date().toISOString();

  await db
    .insert(profiles)
    .values({
      id,
      name: profile.name,
      gender: profile.gender,
      genderProbability: profile.genderProbability,
      sampleSize: profile.sampleSize,
      age: profile.age,
      ageGroup: profile.ageGroup,
      countryId: profile.countryId,
      countryProbability: profile.countryProbability,
      createdAt,
    })
    .onConflictDoUpdate({
      target: profiles.name,
      set: {
        gender: profile.gender,
        genderProbability: profile.genderProbability,
        sampleSize: profile.sampleSize,
        age: profile.age,
        ageGroup: profile.ageGroup,
        countryId: profile.countryId,
        countryProbability: profile.countryProbability,
        createdAt,
      },
    });
}

export async function seedDatabase() {
  const db = getDatabase();

  for (const profile of seedProfiles) {
    await upsertSeedProfile(db, profile);
  }

  console.log(`Seeded ${seedProfiles.length} profiles successfully`);
}

if (import.meta.main) {
  seedDatabase().catch((error) => {
    console.error("Seeding failed:", error);
    process.exit(1);
  });
}
