CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY,
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'client',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS requests (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  service TEXT NOT NULL,
  location TEXT NOT NULL,
  requested_date DATE NOT NULL,
  details TEXT,
  status TEXT NOT NULL DEFAULT 'Demande reçue',
  quote_amount BIGINT,
  payment_status TEXT NOT NULL DEFAULT 'Non payé',
  payment_method TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
