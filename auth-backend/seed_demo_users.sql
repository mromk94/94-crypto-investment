-- Insert demo admin user
INSERT INTO users (name, username, email, password) VALUES (
  'Admin', 'admin', 'admin@tonsuimining.com', '$2y$10$wZAW1kVn6nQ0cTn1jJp8kOQ5vYc4y5k8d6sZB0Ck9jz2sY9bXwQ5a');
-- Password is 'Successtrain2025@' hashed with bcrypt

-- Insert demo user Vanessa Dawn
INSERT INTO users (name, username, email, password) VALUES (
  'Vanessa Dawn', 'vanessadawn', 'itsvanessadawn@gmail.com', '$2y$10$wZAW1kVn6nQ0cTn1jJp8kOQ5vYc4y5k8d6sZB0Ck9jz2sY9bXwQ5a');
-- Password is 'Successtrain2025@' hashed with bcrypt
