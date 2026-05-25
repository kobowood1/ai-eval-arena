CREATE TABLE "accounts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"type" varchar(64) NOT NULL,
	"provider" varchar(64) NOT NULL,
	"provider_account_id" varchar(255) NOT NULL,
	"refresh_token" varchar(512),
	"access_token" varchar(512),
	"expires_at" integer,
	"token_type" varchar(64),
	"scope" varchar(255),
	"id_token" varchar(2048),
	"session_state" varchar(255)
);
--> statement-breakpoint
CREATE TABLE "match_events" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"match_id" uuid NOT NULL,
	"tick" integer NOT NULL,
	"side" varchar(8) NOT NULL,
	"event_type" varchar(32) NOT NULL,
	"payload" jsonb NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "matches" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"mode" varchar(16) NOT NULL,
	"fighter_a_config_id" uuid NOT NULL,
	"fighter_b_config_id" uuid NOT NULL,
	"winner" varchar(16),
	"duration_ms" integer,
	"total_tokens_a" integer,
	"total_tokens_b" integer,
	"estimated_cost_usd" numeric(10, 6),
	"is_public_replay" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"finished_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "model_configs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"label" varchar(64) NOT NULL,
	"provider" varchar(32) NOT NULL,
	"model" varchar(128) NOT NULL,
	"encrypted_key" text NOT NULL,
	"key_iv" text NOT NULL,
	"key_dek_wrapped" text NOT NULL,
	"key_dek_iv" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "ratings" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"model_identifier" varchar(128) NOT NULL,
	"mode" varchar(16) NOT NULL,
	"elo" integer DEFAULT 1500 NOT NULL,
	"wins" integer DEFAULT 0 NOT NULL,
	"losses" integer DEFAULT 0 NOT NULL,
	"ties" integer DEFAULT 0 NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "sessions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"session_token" varchar(255) NOT NULL,
	"user_id" uuid NOT NULL,
	"expires" timestamp NOT NULL,
	CONSTRAINT "sessions_session_token_unique" UNIQUE("session_token")
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" varchar(255) NOT NULL,
	"handle" varchar(64) NOT NULL,
	"kek" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "users_email_unique" UNIQUE("email"),
	CONSTRAINT "users_handle_unique" UNIQUE("handle")
);
--> statement-breakpoint
CREATE TABLE "verification_tokens" (
	"identifier" varchar(255) NOT NULL,
	"token" varchar(255) NOT NULL,
	"expires" timestamp NOT NULL
);
--> statement-breakpoint
ALTER TABLE "accounts" ADD CONSTRAINT "accounts_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "match_events" ADD CONSTRAINT "match_events_match_id_matches_id_fk" FOREIGN KEY ("match_id") REFERENCES "public"."matches"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "matches" ADD CONSTRAINT "matches_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "matches" ADD CONSTRAINT "matches_fighter_a_config_id_model_configs_id_fk" FOREIGN KEY ("fighter_a_config_id") REFERENCES "public"."model_configs"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "matches" ADD CONSTRAINT "matches_fighter_b_config_id_model_configs_id_fk" FOREIGN KEY ("fighter_b_config_id") REFERENCES "public"."model_configs"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "model_configs" ADD CONSTRAINT "model_configs_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "ratings_model_mode_idx" ON "ratings" USING btree ("model_identifier","mode");