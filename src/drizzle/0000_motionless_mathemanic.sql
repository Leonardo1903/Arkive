CREATE TABLE "files" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"folder_id" uuid,
	"imagekit_id" text,
	"owner_id" text NOT NULL,
	"name" text NOT NULL,
	"url" text NOT NULL,
	"thumbnail_url" text,
	"type" text NOT NULL,
	"size" integer NOT NULL,
	"width" integer,
	"height" integer,
	"is_starred" boolean DEFAULT false NOT NULL,
	"is_trashed" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "folders" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"owner_id" text NOT NULL,
	"parent_id" uuid,
	"path" text NOT NULL,
	"name" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
