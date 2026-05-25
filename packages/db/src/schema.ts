import {
  pgTable,
  uuid,
  varchar,
  text,
  timestamp,
  boolean,
  integer,
  numeric,
  jsonb,
  uniqueIndex,
} from 'drizzle-orm/pg-core';

// Binary blobs (KEK, DEK, IVs, ciphertexts) stored as base64 text.
// This avoids the need for a bytea custom type and works with Neon's serverless driver.

export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name'),
  email: varchar('email', { length: 255 }).notNull().unique(),
  emailVerified: timestamp('email_verified'),
  image: text('image'),
  handle: varchar('handle', { length: 64 }).unique(),
  kek: text('kek'), // base64-encoded KEK raw bytes; set on first sign-in via createUser event
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

// NextAuth v5 adapter tables
export const accounts = pgTable('accounts', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  type: varchar('type', { length: 64 }).notNull(),
  provider: varchar('provider', { length: 64 }).notNull(),
  providerAccountId: varchar('provider_account_id', { length: 255 }).notNull(),
  refresh_token: varchar('refresh_token', { length: 512 }),
  access_token: varchar('access_token', { length: 512 }),
  expires_at: integer('expires_at'),
  token_type: varchar('token_type', { length: 64 }),
  scope: varchar('scope', { length: 255 }),
  id_token: varchar('id_token', { length: 2048 }),
  session_state: varchar('session_state', { length: 255 }),
});

export const sessions = pgTable('sessions', {
  id: uuid('id').primaryKey().defaultRandom(),
  sessionToken: varchar('session_token', { length: 255 }).notNull().unique(),
  userId: uuid('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  expires: timestamp('expires').notNull(),
});

export const verificationTokens = pgTable('verification_tokens', {
  identifier: varchar('identifier', { length: 255 }).notNull(),
  token: varchar('token', { length: 255 }).notNull(),
  expires: timestamp('expires').notNull(),
});

export const modelConfigs = pgTable('model_configs', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  label: varchar('label', { length: 64 }).notNull(),
  provider: varchar('provider', { length: 32 }).notNull(),
  model: varchar('model', { length: 128 }).notNull(),
  // AES-256-GCM encrypted API key — all values are base64 strings
  encryptedKey: text('encrypted_key').notNull(),
  keyIv: text('key_iv').notNull(),
  // DEK wrapped with the user's KEK
  keyDekWrapped: text('key_dek_wrapped').notNull(),
  keyDekIv: text('key_dek_iv').notNull(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

export const matches = pgTable('matches', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  mode: varchar('mode', { length: 16 }).notNull(),
  fighterAConfigId: uuid('fighter_a_config_id')
    .notNull()
    .references(() => modelConfigs.id),
  fighterBConfigId: uuid('fighter_b_config_id')
    .notNull()
    .references(() => modelConfigs.id),
  winner: varchar('winner', { length: 16 }),
  durationMs: integer('duration_ms'),
  totalTokensA: integer('total_tokens_a'),
  totalTokensB: integer('total_tokens_b'),
  estimatedCostUsd: numeric('estimated_cost_usd', { precision: 10, scale: 6 }),
  isPublicReplay: boolean('is_public_replay').notNull().default(false),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  finishedAt: timestamp('finished_at'),
});

export const matchEvents = pgTable('match_events', {
  id: uuid('id').primaryKey().defaultRandom(),
  matchId: uuid('match_id')
    .notNull()
    .references(() => matches.id, { onDelete: 'cascade' }),
  tick: integer('tick').notNull(),
  side: varchar('side', { length: 8 }).notNull(),
  eventType: varchar('event_type', { length: 32 }).notNull(),
  payload: jsonb('payload').notNull(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

export const ratings = pgTable(
  'ratings',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    modelIdentifier: varchar('model_identifier', { length: 128 }).notNull(),
    mode: varchar('mode', { length: 16 }).notNull(),
    elo: integer('elo').notNull().default(1500),
    wins: integer('wins').notNull().default(0),
    losses: integer('losses').notNull().default(0),
    ties: integer('ties').notNull().default(0),
    updatedAt: timestamp('updated_at').notNull().defaultNow(),
  },
  (t) => [uniqueIndex('ratings_model_mode_idx').on(t.modelIdentifier, t.mode)],
);
