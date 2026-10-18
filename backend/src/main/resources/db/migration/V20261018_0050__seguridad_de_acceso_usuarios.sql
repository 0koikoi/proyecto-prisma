ALTER TABLE users
    ADD COLUMN failed_login_attempts integer NOT NULL DEFAULT 0,
    ADD COLUMN locked_until timestamptz,
    ADD COLUMN must_change_password boolean NOT NULL DEFAULT false,
    ADD CONSTRAINT ck_users_failed_login_attempts CHECK (failed_login_attempts >= 0);

UPDATE users
SET password_hash = '$2a$10$b0.wWhwMjnnn9ERurLtt.e/ZUFDEH5jMIgRSu6uLT2csIygcyPQIC',
    must_change_password = true
WHERE username = 'admin'
  AND password_hash IN (
      '$2a$10$dXJ3SW6G7P50lGmMkkmwe.20cQQubK3.HZWzG3YB1tlRy.fqvM/BG',
      '$2a$10$b0.wWhwMjnnn9ERurLtt.e/ZUFDEH5jMIgRSu6uLT2csIygcyPQIC'
  );
