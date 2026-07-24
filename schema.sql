-- SQL Schema for XN Reward / NXB Application (PostgreSQL & Supabase Compatible)

CREATE TABLE IF NOT EXISTS public.users (
  id VARCHAR(100) PRIMARY KEY,
  name VARCHAR(150) NOT NULL,
  email VARCHAR(150) UNIQUE NOT NULL,
  password TEXT DEFAULT '',
  role VARCHAR(20) DEFAULT 'user',
  balance NUMERIC(15, 2) DEFAULT 0,
  energy INT DEFAULT 1000,
  max_energy INT DEFAULT 1000,
  energy_level INT DEFAULT 1,
  hit_level INT DEFAULT 1,
  hit_damage NUMERIC(10, 2) DEFAULT 0.5,
  subject_level INT DEFAULT 1,
  subject_hp NUMERIC(15, 2) DEFAULT 100,
  subject_max_hp NUMERIC(15, 2) DEFAULT 100,
  referral_code VARCHAR(50) UNIQUE,
  referred_by VARCHAR(100),
  device_id VARCHAR(100),
  device_name VARCHAR(150),
  last_check_in_date VARCHAR(20),
  check_in_streak INT DEFAULT 0,
  avatar TEXT,
  is_banned BOOLEAN DEFAULT FALSE,
  last_active TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS public.tasks (
  id VARCHAR(100) PRIMARY KEY,
  title VARCHAR(200) NOT NULL,
  description TEXT,
  reward NUMERIC(15, 2) DEFAULT 100,
  type VARCHAR(20) DEFAULT 'one_time',
  category VARCHAR(50) DEFAULT 'social',
  action_url TEXT,
  requires_proof BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS public.task_submissions (
  id VARCHAR(100) PRIMARY KEY,
  task_id VARCHAR(100) REFERENCES public.tasks(id) ON DELETE CASCADE,
  user_id VARCHAR(100) REFERENCES public.users(id) ON DELETE CASCADE,
  user_name VARCHAR(150),
  user_email VARCHAR(150),
  proof_image_url TEXT,
  status VARCHAR(20) DEFAULT 'pending',
  submitted_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  reviewed_at TIMESTAMP WITH TIME ZONE
);

CREATE TABLE IF NOT EXISTS public.withdrawal_records (
  id VARCHAR(100) PRIMARY KEY,
  user_id VARCHAR(100) REFERENCES public.users(id) ON DELETE CASCADE,
  user_name VARCHAR(150),
  user_email VARCHAR(150),
  taka_amount NUMERIC(15, 2) NOT NULL,
  coins_amount NUMERIC(15, 2) NOT NULL,
  payment_method VARCHAR(50) NOT NULL,
  account_number VARCHAR(50) NOT NULL,
  status VARCHAR(20) DEFAULT 'pending',
  requested_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  processed_at TIMESTAMP WITH TIME ZONE
);

CREATE TABLE IF NOT EXISTS public.referrals (
  id VARCHAR(100) PRIMARY KEY,
  referrer_id VARCHAR(100) REFERENCES public.users(id) ON DELETE CASCADE,
  referred_user_id VARCHAR(100) REFERENCES public.users(id) ON DELETE CASCADE,
  referred_user_name VARCHAR(150),
  referred_user_email VARCHAR(150),
  referred_device_id VARCHAR(100),
  referred_device_name VARCHAR(150),
  is_first_referral BOOLEAN DEFAULT FALSE,
  status VARCHAR(20) DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  verified_at TIMESTAMP WITH TIME ZONE
);

CREATE TABLE IF NOT EXISTS public.otps (
  email VARCHAR(150) PRIMARY KEY,
  code VARCHAR(10) NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL
);
