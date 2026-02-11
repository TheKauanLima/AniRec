-- Add email verification column to users table
ALTER TABLE users 
ADD COLUMN is_verified BOOLEAN DEFAULT FALSE,
ADD COLUMN verification_token VARCHAR(255),
ADD COLUMN verification_token_expires TIMESTAMP;

-- Create index for faster token lookups
CREATE INDEX IF NOT EXISTS idx_users_verification_token ON users(verification_token);
