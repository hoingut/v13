-- ====================================================================
-- XN REWARD / NXB APPLICATION - FULL PROJECT DATABASE SCHEMA
-- Compatible with PostgreSQL & Supabase Database
-- ====================================================================

-- 1. USERS TABLE
CREATE TABLE IF NOT EXISTS public.users (
  id VARCHAR(100) PRIMARY KEY,
  name VARCHAR(150) NOT NULL,
  email VARCHAR(150) UNIQUE NOT NULL,
  password TEXT DEFAULT '',
  role VARCHAR(20) DEFAULT 'user',
  balance NUMERIC(15, 2) DEFAULT 0,            -- Coins Balance (1k Coin = 2 BDT)
  taka_balance NUMERIC(15, 2) DEFAULT 0,       -- Taka BDT Balance (Earned from Tasks & Referrals)
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
  last_check_in_date VARCHAR(20),               -- YYYY-MM-DD
  check_in_streak INT DEFAULT 0,               -- Current streak count (1-7)
  avatar TEXT,                                 -- Hosted Profile Picture / Avatar URL
  is_banned BOOLEAN DEFAULT FALSE,             -- Ban flag for anti-fraud
  last_active TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. TASKS TABLE
CREATE TABLE IF NOT EXISTS public.tasks (
  id VARCHAR(100) PRIMARY KEY,
  title VARCHAR(200) NOT NULL,
  description TEXT,
  reward NUMERIC(15, 2) DEFAULT 100,          -- Taka BDT reward for completing task
  type VARCHAR(20) DEFAULT 'one_time',         -- 'daily' or 'one_time'
  category VARCHAR(50) DEFAULT 'social',       -- 'social', 'telegram', 'youtube', etc.
  action_url TEXT,
  requires_proof BOOLEAN DEFAULT TRUE,        -- Screenshot proof required
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. TASK SUBMISSIONS TABLE
CREATE TABLE IF NOT EXISTS public.task_submissions (
  id VARCHAR(100) PRIMARY KEY,
  task_id VARCHAR(100) REFERENCES public.tasks(id) ON DELETE CASCADE,
  user_id VARCHAR(100) REFERENCES public.users(id) ON DELETE CASCADE,
  user_name VARCHAR(150),
  user_email VARCHAR(150),
  proof_image_url TEXT,                        -- ImgBB hosted screenshot URL
  status VARCHAR(20) DEFAULT 'pending',        -- 'pending' | 'approved' | 'rejected'
  rejection_reason TEXT,
  submitted_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  reviewed_at TIMESTAMP WITH TIME ZONE
);

-- 4. WITHDRAWAL RECORDS TABLE
CREATE TABLE IF NOT EXISTS public.withdrawals (
  id VARCHAR(100) PRIMARY KEY,
  user_id VARCHAR(100) REFERENCES public.users(id) ON DELETE CASCADE,
  user_name VARCHAR(150),
  user_email VARCHAR(150),
  payment_method VARCHAR(50) NOT NULL,         -- 'bKash' | 'Nagad' | 'Rocket' | 'Binance'
  account_number VARCHAR(100) NOT NULL,
  coins_amount NUMERIC(15, 2) DEFAULT 0,
  taka_amount NUMERIC(15, 2) NOT NULL,         -- Final payable BDT amount
  withdraw_type VARCHAR(20) DEFAULT 'coins',  -- 'coins' or 'taka'
  status VARCHAR(20) DEFAULT 'pending',        -- 'pending' | 'approved' | 'rejected'
  rejection_reason TEXT,
  requested_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  processed_at TIMESTAMP WITH TIME ZONE
);

-- 5. REFERRALS TABLE
CREATE TABLE IF NOT EXISTS public.referrals (
  id VARCHAR(100) PRIMARY KEY,
  referrer_id VARCHAR(100) REFERENCES public.users(id) ON DELETE CASCADE,
  referred_user_id VARCHAR(100) REFERENCES public.users(id) ON DELETE CASCADE,
  referred_user_name VARCHAR(150),
  referred_user_email VARCHAR(150),
  referred_device_id VARCHAR(100),
  referred_device_name VARCHAR(150),
  is_first_referral BOOLEAN DEFAULT FALSE,
  status VARCHAR(20) DEFAULT 'pending',        -- 'pending' | 'verified' | 'failed'
  failure_reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  verified_at TIMESTAMP WITH TIME ZONE
);

-- 6. OTP VERIFICATION CODES TABLE
CREATE TABLE IF NOT EXISTS public.otps (
  id VARCHAR(100) PRIMARY KEY,
  email VARCHAR(150) NOT NULL,
  otp_code VARCHAR(10) NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- INDEXES FOR MAXIMUM QUERY PERFORMANCE
CREATE INDEX IF NOT EXISTS idx_users_email ON public.users(email);
CREATE INDEX IF NOT EXISTS idx_users_referral_code ON public.users(referral_code);
CREATE INDEX IF NOT EXISTS idx_task_sub_user ON public.task_submissions(user_id);
CREATE INDEX IF NOT EXISTS idx_withdrawals_user ON public.withdrawals(user_id);
CREATE INDEX IF NOT EXISTS idx_referrals_referrer ON public.referrals(referrer_id);

-- ENSURE ALL COLUMNS EXIST FOR EXISTING DATABASES (SAFE MIGRATION)
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS taka_balance NUMERIC(15, 2) DEFAULT 0;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS avatar TEXT;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS is_banned BOOLEAN DEFAULT FALSE;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS last_check_in_date VARCHAR(20);
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS check_in_streak INT DEFAULT 0;
ALTER TABLE public.withdrawals ADD COLUMN IF NOT EXISTS withdraw_type VARCHAR(20) DEFAULT 'coins';
