CREATE TABLE "profiles" (
	"id" uuid PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"gender" text NOT NULL,
	"gender_probability" double precision NOT NULL,
	"sample_size" double precision NOT NULL,
	"age" double precision NOT NULL,
	"age_group" text NOT NULL,
	"country_id" text NOT NULL,
	"country_probability" double precision NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "profiles_name_unique" UNIQUE("name")
);
