CREATE TABLE "_infra_probe" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"label" text NOT NULL,
	"checked_at" timestamp with time zone DEFAULT now() NOT NULL
);
