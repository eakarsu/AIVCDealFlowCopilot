-- Scrypt credentials include the scheme, salt, and a 64-byte hash, which is
-- longer than the legacy VARCHAR(120) column.
ALTER TABLE users ALTER COLUMN password TYPE TEXT;
