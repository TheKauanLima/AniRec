-- Add MAL OAuth fields to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS mal_id INTEGER UNIQUE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS mal_username VARCHAR(255);
ALTER TABLE users ADD COLUMN IF NOT EXISTS mal_access_token TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS mal_refresh_token TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS mal_token_expires TIMESTAMP;

-- Allow password_hash to be NULL for MAL-only users
ALTER TABLE users ALTER COLUMN password_hash DROP NOT NULL;

-- Allow email to be NULL for MAL-only users
ALTER TABLE users ALTER COLUMN email DROP NOT NULL;

-- Drop the unique constraint on email so multiple MAL-only users (with NULL email) can exist
ALTER TABLE users DROP CONSTRAINT IF EXISTS users_email_key;
CREATE UNIQUE INDEX IF NOT EXISTS idx_users_email_unique ON users (email) WHERE email IS NOT NULL;

-- Index for MAL ID lookups
CREATE INDEX IF NOT EXISTS idx_users_mal_id ON users (mal_id);
