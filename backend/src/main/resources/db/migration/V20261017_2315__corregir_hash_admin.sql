-- V2 contained a BCrypt hash that did not match its documented temporary password.
-- Update only the untouched seed account; never overwrite a password changed by an operator.
UPDATE users
SET password_hash = '$2a$10$b0.wWhwMjnnn9ERurLtt.e/ZUFDEH5jMIgRSu6uLT2csIygcyPQIC'
WHERE username = 'admin'
  AND password_hash = '$2a$10$dXJ3SW6G7P50lGmMkkmwe.20cQQubK3.HZWzG3YB1tlRy.fqvM/BG';
