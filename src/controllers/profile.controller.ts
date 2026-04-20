import type { Context } from "hono";
import { buildExternalProfileData } from "../lib/external-apis";
import { createProfileRequestSchema } from "../lib/schemas";
import {
  createProfile,
  deleteProfileById,
  findProfileById,
  findProfileByName,
  findProfiles,
  type NewProfileRecord,
  type ProfileRecord,
} from "../repository";
import { createUuidV7, normalizeName } from "../utils";

type ApiSuccess<T> = {
  status: "success";
  data: T;
};

type ApiSuccessWithMessage<T> = {
  status: "success";
  message: string;
  data: T;
};

type ApiError = {
  status: "error";
  message: string;
};

type ProfileResponse = {
  id: string;
  name: string;
  gender: string;
  gender_probability: number;
  sample_size: number;
  age: number;
  age_group: string;
  country_id: string;
  country_probability: number;
  created_at: string;
};

type ProfileListItem = {
  id: string;
  name: string;
  gender: string;
  age: number;
  age_group: string;
  country_id: string;
};

type WorkerEnv = {
  DB: D1Database;
};

function toProfileResponse(profile: ProfileRecord): ProfileResponse {
  return {
    id: profile.id,
    name: profile.name,
    gender: profile.gender,
    gender_probability: profile.genderProbability,
    sample_size: profile.sampleSize,
    age: profile.age,
    age_group: profile.ageGroup,
    country_id: profile.countryId,
    country_probability: profile.countryProbability,
    created_at: profile.createdAt,
  };
}

function toProfileListItem(profile: ProfileRecord): ProfileListItem {
  return {
    id: profile.id,
    name: profile.name,
    gender: profile.gender,
    age: profile.age,
    age_group: profile.ageGroup,
    country_id: profile.countryId,
  };
}

function isApiError(
  error: unknown,
): error is { status: "error"; message: string; code: number } {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    "message" in error
  );
}

const profileCache = new Map<string, ProfileResponse>();
const inFlightProfileCreations = new Map<string, Promise<ProfileResponse>>();

async function createOrGetProfile(env: WorkerEnv, rawName: string) {
  const normalizedName = normalizeName(rawName);

  const cached = profileCache.get(normalizedName);
  if (cached) {
    return {
      alreadyExists: true,
      profile: {
        ...cached,
        name: rawName,
      },
    };
  }

  const existing = await findProfileByName(env, normalizedName);
  if (existing) {
    const response = toProfileResponse(existing);
    profileCache.set(normalizedName, response);

    return {
      alreadyExists: true,
      profile: {
        ...response,
        name: rawName,
      },
    };
  }

  const existingInFlight = inFlightProfileCreations.get(normalizedName);
  if (existingInFlight) {
    const profile = await existingInFlight;
    return {
      alreadyExists: true,
      profile: {
        ...profile,
        name: rawName,
      },
    };
  }

  const creationPromise = (async () => {
    const externalData = await buildExternalProfileData(normalizedName);

    const newProfile: NewProfileRecord = {
      id: createUuidV7(),
      name: normalizedName,
      gender: externalData.gender,
      genderProbability: externalData.genderProbability,
      sampleSize: externalData.sampleSize,
      age: externalData.age,
      ageGroup: externalData.ageGroup,
      countryId: externalData.countryId,
      countryProbability: externalData.countryProbability,
      createdAt: new Date().toISOString(),
    };

    const created = await createProfile(env, newProfile);
    const response = toProfileResponse(created);
    profileCache.set(normalizedName, response);
    return response;
  })();

  inFlightProfileCreations.set(normalizedName, creationPromise);

  try {
    const profile = await creationPromise;
    return {
      alreadyExists: false,
      profile: {
        ...profile,
        name: rawName,
      },
    };
  } finally {
    inFlightProfileCreations.delete(normalizedName);
  }
}

export async function createProfileController(
  c: Context<{ Bindings: WorkerEnv }>,
) {
  try {
    const body = await c.req.json().catch(() => null);
    const parsed = createProfileRequestSchema.safeParse(body);

    if (!parsed.success) {
      const issue = parsed.error.issues[0];
      const status = issue?.code === "invalid_type" ? 422 : 400;

      return c.json<ApiError>(
        {
          status: "error",
          message: issue?.message ?? "Invalid request body",
        },
        status,
      );
    }

    const rawName = parsed.data.name;
    const name = normalizeName(rawName);

    if (!name) {
      return c.json<ApiError>(
        {
          status: "error",
          message: "Missing or empty name",
        },
        400,
      );
    }

    const result = await createOrGetProfile(c.env, rawName);

    if (result.alreadyExists) {
      return c.json<ApiSuccessWithMessage<ProfileResponse>>(
        {
          status: "success",
          message: "Profile already exists",
          data: result.profile,
        },
        200,
      );
    }

    return c.json<ApiSuccess<ProfileResponse>>(
      {
        status: "success",
        data: result.profile,
      },
      201,
    );
  } catch (error) {
    if (isApiError(error)) {
      return c.json<ApiError>(
        {
          status: "error",
          message: error.message,
        },
        error.code as 400 | 401 | 403 | 404 | 409 | 422 | 500 | 502,
      );
    }

    console.error(error);
    return c.json<ApiError>(
      {
        status: "error",
        message: "Internal server error",
      },
      500,
    );
  }
}

export async function getProfileByIdController(
  c: Context<{ Bindings: WorkerEnv }>,
) {
  const id = c.req.param("id")!;

  const profile = await findProfileById(c.env, id);

  if (!profile) {
    return c.json<ApiError>(
      {
        status: "error",
        message: "Profile not found",
      },
      404,
    );
  }

  return c.json<ApiSuccess<ProfileResponse>>({
    status: "success",
    data: toProfileResponse(profile),
  });
}

export async function listProfilesController(
  c: Context<{ Bindings: WorkerEnv }>,
) {
  const gender = c.req.query("gender");
  const countryId = c.req.query("country_id");
  const ageGroup = c.req.query("age_group");

  const rows = await findProfiles(c.env, {
    gender: gender?.trim().toLowerCase(),
    countryId: countryId?.trim().toLowerCase(),
    ageGroup: ageGroup?.trim().toLowerCase() as
      | "child"
      | "teenager"
      | "adult"
      | "senior"
      | undefined,
  });

  return c.json({
    status: "success",
    count: rows.length,
    data: rows.map(toProfileListItem),
  });
}

export async function deleteProfileController(
  c: Context<{ Bindings: WorkerEnv }>,
) {
  const id = c.req.param("id")!;

  const deleted = await deleteProfileById(c.env, id);

  if (!deleted) {
    return c.json<ApiError>(
      {
        status: "error",
        message: "Profile not found",
      },
      404,
    );
  }

  return c.body(null, 204);
}
