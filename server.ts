import express from 'express';
import path from 'path';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { SystemSettings, User, Task, TaskSubmission, ReferralRecord, WithdrawalRecord } from './src/types.js';

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '15mb' }));

// Initialize Supabase client
const SUPABASE_URL = process.env.SUPABASE_URL || 'https://tcmzgqedczwvacflqpic.supabase.co';
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInRlZiI6InRjbXpncWVkY3p3dmFjZmxxcGljIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4NDg2NTI3MCwiZXhwIjoyMTAwNDQxMjcwfQ.NdZXhs0mQ7-58NGgN7Wo3lGxCcGWUrS_GgWpNonznTI';

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

// System Settings State
let systemSettings: SystemSettings = {
  imgbbApiKey: process.env.IMGBB_API_KEY || '',
  brevoApiKey: process.env.BREVO_API_KEY || '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',
  brevoDailyLimit: 290,
  brevoUsedToday: 0,
  resendApiKey: process.env.RESEND_API_KEY || 're_QUfehT2K_LUef2YPJb14rBVAKwwiijFkk',
  resendDailyLimit: 98,
  resendUsedToday: 0,
  rechargeIntervalHours: 6,
  defaultHitDamage: 0.5,
  adminEmail: 'admin@gmail.com',
};

// In-memory persistent state sync to ensure 100% smooth execution
const mockUsers: Map<string, User> = new Map();
const mockOtps: Map<string, { code: string; expiresAt: number }> = new Map();
const mockTasks: Task[] = [
  {
    id: 'task_1',
    title: 'Join HedHog Official Telegram',
    description: 'Subscribe to our official Telegram channel for $NXB announcements and drops.',
    reward: 100,
    type: 'one_time',
    category: 'telegram',
    actionUrl: 'https://t.me',
    requiresProof: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'task_2',
    title: 'Subscribe to YouTube Channel',
    description: 'Watch our latest $NXB gameplay video and subscribe.',
    reward: 150,
    type: 'one_time',
    category: 'youtube',
    actionUrl: 'https://youtube.com',
    requiresProof: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'task_3',
    title: 'Daily Check-in & Share',
    description: 'Log into $NXB Airdrop today and share your status with friends.',
    reward: 50,
    type: 'daily',
    category: 'social',
    actionUrl: 'https://x.com',
    requiresProof: false,
    createdAt: new Date().toISOString(),
  }
];
const mockSubmissions: TaskSubmission[] = [];
const mockReferrals: ReferralRecord[] = [];
const mockWithdrawals: WithdrawalRecord[] = [];

// Admin Emails List
const ADMIN_EMAILS = ['hello.alihosen@gmail.com', 'admin@gmail.com'];

// Helper: Seed Default Admin User
const adminUser: User = {
  id: 'usr_admin',
  name: 'NXB Admin',
  email: 'hello.alihosen@gmail.com',
  role: 'admin',
  balance: 10000,
  energy: 1000,
  maxEnergy: 1000,
  energyLevel: 1,
  hitLevel: 1,
  hitDamage: 0.5,
  subjectLevel: 1,
  subjectHp: 100,
  subjectMaxHp: 100,
  referralCode: 'ADMIN777',
  deviceId: 'device_admin_pc',
  deviceName: 'Admin Workstation',
  lastActive: new Date().toISOString(),
  createdAt: new Date().toISOString(),
};
mockUsers.set(adminUser.id, adminUser);
mockUsers.set(adminUser.email, adminUser);
mockUsers.set('admin@gmail.com', { ...adminUser, email: 'admin@gmail.com' });

// Energy Auto Recharge calculation (6 hours full refuel = 21600 seconds)
function calculateRechargedEnergy(user: User): number {
  const now = Date.now();
  const lastActiveTime = new Date(user.lastActive).getTime();
  const elapsedSeconds = Math.max(0, (now - lastActiveTime) / 1000);
  
  // Refill rate per second: maxEnergy / (6 * 3600)
  const fullRechargeSeconds = systemSettings.rechargeIntervalHours * 3600;
  const energyAdded = (user.maxEnergy / fullRechargeSeconds) * elapsedSeconds;
  
  return Math.min(user.maxEnergy, Math.round(user.energy + energyAdded));
}

// SMTP Failover Handler (Brevo -> Resend -> Fallback)
async function sendOtpEmail(email: string, otpCode: string): Promise<{ success: boolean; providerUsed: string; message: string }> {
  const brevoSenderEmail = process.env.BREVO_SENDER_EMAIL || 'noreply@nxpost.online';
  // Check Brevo first
  if (systemSettings.brevoApiKey && systemSettings.brevoUsedToday < systemSettings.brevoDailyLimit) {
    try {
      const res = await fetch('https://api.brevo.com/v3/smtp/email', {
        method: 'POST',
        headers: {
          'accept': 'application/json',
          'api-key': systemSettings.brevoApiKey,
          'content-type': 'application/json',
        },
        body: JSON.stringify({
          sender: { name: 'XN Reward', email: brevoSenderEmail },
          to: [{ email }],
          subject: 'Your XN Reward Verification OTP',
          htmlContent: `<div style="font-family:sans-serif;padding:20px;background:#1a1412;color:#f3e8df;border-radius:12px;"><h2>XN Reward Email Verification</h2><p>Your OTP code is: <b style="font-size:24px;color:#f59e0b;">${otpCode}</b></p><p>This code expires in 10 minutes.</p></div>`,
        }),
      });
      if (res.ok) {
        systemSettings.brevoUsedToday++;
        return { success: true, providerUsed: 'Brevo', message: 'OTP sent via Brevo' };
      } else {
        const errText = await res.text();
        console.error('Brevo response error:', errText);
      }
    } catch (e) {
      console.error('Brevo SMTP failed, falling back to Resend:', e);
    }
  }

  // Fallback to Resend
  if (systemSettings.resendApiKey && systemSettings.resendUsedToday < systemSettings.resendDailyLimit) {
    try {
      const res = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${systemSettings.resendApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: 'XN Reward <onboarding@resend.dev>',
          to: email,
          subject: 'Your XN Reward Verification OTP',
          html: `<div style="font-family:sans-serif;padding:20px;background:#1a1412;color:#f3e8df;border-radius:12px;"><h2>XN Reward Email Verification</h2><p>Your OTP code is: <b style="font-size:24px;color:#f59e0b;">${otpCode}</b></p></div>`,
        }),
      });
      if (res.ok) {
        systemSettings.resendUsedToday++;
        return { success: true, providerUsed: 'Resend', message: 'OTP sent via Resend' };
      } else {
        const errText = await res.text();
        console.error('Resend response error:', errText);
      }
    } catch (e) {
      console.error('Resend SMTP failed:', e);
    }
  }

  // Developer Preview mode helper
  console.log(`[SMTP PREVIEW HELPER] OTP for ${email}: ${otpCode}`);
  return { 
    success: true, 
    providerUsed: 'Preview Console', 
    message: `OTP generated (${otpCode}). SMTP keys can be updated in Admin Panel.` 
  };
}

// ImgBB Upload Proxy
async function uploadToImgBB(base64Image: string): Promise<string> {
  const apiKey = systemSettings.imgbbApiKey || process.env.IMGBB_API_KEY;
  if (!apiKey) {
    // Return base64 or placeholder preview link if API key is not yet entered
    return base64Image;
  }

  try {
    const cleanBase64 = base64Image.replace(/^data:image\/\w+;base64,/, '');
    const formData = new URLSearchParams();
    formData.append('image', cleanBase64);

    const response = await fetch(`https://api.imgbb.com/1/upload?key=${apiKey}`, {
      method: 'POST',
      body: formData,
    });

    const data = await response.json();
    if (data && data.data && data.data.url) {
      return data.data.url;
    }
  } catch (err) {
    console.error('ImgBB upload error:', err);
  }
  return base64Image;
}

// Helper: Get user by ID or Email with Supabase fallback
async function getUserById(userIdOrEmail: string): Promise<User | null> {
  if (!userIdOrEmail) return null;
  const cleanStr = String(userIdOrEmail).toLowerCase().trim();

  // 1. Memory lookup
  let user = mockUsers.get(userIdOrEmail) || mockUsers.get(cleanStr);
  if (user) return user;

  // 2. Supabase lookup
  try {
    const { data: dbUser } = await supabase
      .from('users')
      .select('*')
      .or(`id.eq.${userIdOrEmail},email.eq.${cleanStr},referral_code.eq.${userIdOrEmail}`)
      .maybeSingle();

    if (dbUser) {
      user = {
        id: dbUser.id,
        name: dbUser.name,
        email: dbUser.email,
        role: dbUser.role || 'user',
        balance: Number(dbUser.balance) || 0,
        energy: dbUser.energy || 1000,
        maxEnergy: dbUser.max_energy || 1000,
        energyLevel: dbUser.energy_level || 1,
        hitLevel: dbUser.hit_level || 1,
        hitDamage: Number(dbUser.hit_damage) || 0.5,
        subjectLevel: dbUser.subject_level || 1,
        subjectHp: Number(dbUser.subject_hp) || 100,
        subjectMaxHp: Number(dbUser.subject_max_hp) || 100,
        referralCode: dbUser.referral_code || '',
        referredBy: dbUser.referred_by || undefined,
        deviceId: dbUser.device_id || '',
        deviceName: dbUser.device_name || '',
        lastActive: dbUser.last_active || new Date().toISOString(),
        createdAt: dbUser.created_at || new Date().toISOString(),
      };
      mockUsers.set(user.id, user);
      mockUsers.set(user.email.toLowerCase(), user);
      return user;
    }
  } catch (err) {
    console.error('Supabase getUserById error:', err);
  }

  return null;
}

// Helper: Save/Update user in Supabase
async function saveUserToSupabase(user: User): Promise<void> {
  if (!user || !user.id) return;
  try {
    const { error } = await supabase.from('users').upsert({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      balance: user.balance,
      energy: user.energy,
      max_energy: user.maxEnergy,
      energy_level: user.energyLevel,
      hit_level: user.hitLevel,
      hit_damage: user.hitDamage,
      subject_level: user.subjectLevel,
      subject_hp: user.subjectHp,
      subject_max_hp: user.subjectMaxHp,
      referral_code: user.referralCode,
      referred_by: user.referredBy || null,
      device_id: user.deviceId,
      device_name: user.deviceName,
      last_active: user.lastActive,
    });
    if (error) {
      console.error('Supabase user upsert error:', error.message, error.details);
    }
  } catch (err) {
    console.error('Supabase saveUserToSupabase error:', err);
  }
}

// ---------------- API ROUTES ----------------

// 1. Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// 2. Auth: Send OTP (Gmail only)
app.post('/api/auth/send-otp', async (req, res) => {
  const { email } = req.body;
  if (!email || !email.toLowerCase().endsWith('@gmail.com')) {
    return res.status(400).json({ error: 'Only Gmail (@gmail.com) addresses are allowed!' });
  }

  const cleanEmail = email.toLowerCase().trim();
  const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
  const expiresAt = Date.now() + 10 * 60 * 1000;

  mockOtps.set(cleanEmail, { code: otpCode, expiresAt });

  // Persist in Supabase for cross-serverless lambda synchronization
  try {
    await supabase.from('otps').upsert({
      email: cleanEmail,
      code: otpCode,
      expires_at: new Date(expiresAt).toISOString(),
    });
  } catch (err) {
    console.error('Supabase OTP save error:', err);
  }

  const emailResult = await sendOtpEmail(cleanEmail, otpCode);
  res.json({
    success: true,
    message: emailResult.message,
    provider: emailResult.providerUsed,
  });
});

// 3. Auth: Register
app.post('/api/auth/register', async (req, res) => {
  const { name, email, password, otp, referralCode, deviceId, deviceName } = req.body;

  if (!email || !email.toLowerCase().endsWith('@gmail.com')) {
    return res.status(400).json({ error: 'Only Gmail (@gmail.com) addresses are allowed!' });
  }

  const cleanEmail = email.toLowerCase().trim();
  const cleanOtp = String(otp || '').trim();

  // Validate OTP from memory or Supabase
  let isValidOtp = false;
  const otpEntry = mockOtps.get(cleanEmail);
  if (otpEntry && String(otpEntry.code).trim() === cleanOtp && Date.now() <= otpEntry.expiresAt) {
    isValidOtp = true;
  } else {
    try {
      const { data: dbOtp } = await supabase
        .from('otps')
        .select('*')
        .eq('email', cleanEmail)
        .maybeSingle();

      if (dbOtp && String(dbOtp.code).trim() === cleanOtp) {
        const expiresTime = new Date(dbOtp.expires_at).getTime();
        if (Date.now() <= expiresTime) {
          isValidOtp = true;
        }
      }
    } catch (err) {
      console.error('Supabase OTP check error:', err);
    }
  }

  if (!isValidOtp) {
    return res.status(400).json({ error: 'Invalid or expired OTP code!' });
  }

  // Check existing user
  let existingUser = mockUsers.get(cleanEmail);
  if (!existingUser) {
    try {
      const { data: dbUser } = await supabase
        .from('users')
        .select('*')
        .eq('email', cleanEmail)
        .maybeSingle();

      if (dbUser) {
        existingUser = {
          id: dbUser.id,
          name: dbUser.name,
          email: dbUser.email,
          role: dbUser.role || 'user',
          balance: Number(dbUser.balance) || 0,
          energy: dbUser.energy || 1000,
          maxEnergy: dbUser.max_energy || 1000,
          energyLevel: dbUser.energy_level || 1,
          hitLevel: dbUser.hit_level || 1,
          hitDamage: Number(dbUser.hit_damage) || 0.5,
          subjectLevel: dbUser.subject_level || 1,
          subjectHp: Number(dbUser.subject_hp) || 100,
          subjectMaxHp: Number(dbUser.subject_max_hp) || 100,
          referralCode: dbUser.referral_code || '',
          referredBy: dbUser.referred_by || undefined,
          deviceId: dbUser.device_id || '',
          deviceName: dbUser.device_name || '',
          lastActive: dbUser.last_active || new Date().toISOString(),
          createdAt: dbUser.created_at || new Date().toISOString(),
        };
        mockUsers.set(existingUser.id, existingUser);
        mockUsers.set(cleanEmail, existingUser);
      }
    } catch (err) {
      console.error('Supabase check existing user error:', err);
    }
  }

  if (existingUser) {
    return res.status(400).json({ error: 'User with this Gmail already exists. Please log in.' });
  }

  // Referral Anti-Fraud Check
  let referredByUserId: string | undefined = undefined;
  if (referralCode) {
    let referrerUser: User | undefined;
    for (const u of mockUsers.values()) {
      if (u.referralCode === referralCode) {
        referrerUser = u;
        break;
      }
    }

    if (referrerUser) {
      // Check Anti-Self Referral Rule (Device ID or Device Name match)
      const isDeviceMatch = 
        (deviceId && referrerUser.deviceId === deviceId) ||
        (deviceName && referrerUser.deviceName && referrerUser.deviceName.toLowerCase() === deviceName.toLowerCase());

      if (isDeviceMatch) {
        return res.status(400).json({
          error: 'Referral Failed: You cannot use your own device referral link! Same device detected.'
        });
      }

      referredByUserId = referrerUser.id;
    }
  }

  const userId = `usr_${Date.now()}`;
  const userRefCode = `NXB${Math.floor(100000 + Math.random() * 900000)}`;

  const newUser: User = {
    id: userId,
    name: name || 'XN Hunter',
    email: cleanEmail,
    role: ADMIN_EMAILS.includes(cleanEmail) ? 'admin' : 'user',
    balance: 100, // Joining bonus 100 Coin
    energy: 200, // Default Charge: 200
    maxEnergy: 200,
    energyLevel: 1,
    hitLevel: 1,
    hitDamage: 0.5,
    subjectLevel: 1,
    subjectHp: 100, // Default Subject 1 HP: 100
    subjectMaxHp: 100,
    referralCode: userRefCode,
    referredBy: referredByUserId,
    deviceId: deviceId || `dev_${Math.random()}`,
    deviceName: deviceName || 'Generic Device',
    lastActive: new Date().toISOString(),
    createdAt: new Date().toISOString(),
  };

  mockUsers.set(userId, newUser);
  mockUsers.set(cleanEmail, newUser);

  // Persist user in Supabase
  try {
    await supabase.from('users').upsert({
      id: newUser.id,
      name: newUser.name,
      email: newUser.email,
      password: password || '',
      role: newUser.role,
      balance: newUser.balance,
      energy: newUser.energy,
      max_energy: newUser.maxEnergy,
      energy_level: newUser.energyLevel,
      hit_level: newUser.hitLevel,
      hit_damage: newUser.hitDamage,
      subject_level: newUser.subjectLevel,
      subject_hp: newUser.subjectHp,
      subject_max_hp: newUser.subjectMaxHp,
      referral_code: newUser.referralCode,
      referred_by: newUser.referredBy,
      device_id: newUser.deviceId,
      device_name: newUser.deviceName,
      last_active: newUser.lastActive,
      created_at: newUser.createdAt,
    });
  } catch (err) {
    console.error('Supabase save user error:', err);
  }

  // If referred, create Referral Record & evaluate verification rules
  if (referredByUserId) {
    const referrer = mockUsers.get(referredByUserId);
    if (referrer) {
      // Check if this is 1st referral or subsequent
      const referrerPrevReferrals = mockReferrals.filter(r => r.referrerId === referrer.id);
      const isFirst = referrerPrevReferrals.length === 0;

      const refRecord: ReferralRecord = {
        id: `ref_${Date.now()}`,
        referrerId: referrer.id,
        referredUserId: newUser.id,
        referredUserName: newUser.name,
        referredUserEmail: newUser.email,
        referredDeviceId: newUser.deviceId,
        referredDeviceName: newUser.deviceName || 'Device',
        isFirstReferral: isFirst,
        status: isFirst ? 'verified' : 'pending', // 1st referral verified fast; subsequent requires 12h evaluation
        createdAt: new Date().toISOString(),
      };

      if (isFirst) {
        // 10 Taka reward for referral (1k coins = 2 Taka => 5000 coins)
        referrer.balance += 5000;
        refRecord.verifiedAt = new Date().toISOString();
      }

      mockReferrals.push(refRecord);
    }
  }

  mockOtps.delete(cleanEmail);

  res.json({
    success: true,
    user: newUser,
    token: `token_${userId}`,
  });
});

// 4. Auth: Login
app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email) {
    return res.status(400).json({ error: 'Email is required' });
  }

  if (!password) {
    return res.status(400).json({ error: 'Password is required' });
  }

  const cleanEmail = email.toLowerCase().trim();
  let user = mockUsers.get(cleanEmail);
  let dbUserPassword = '';

  try {
    const { data: dbUser } = await supabase
      .from('users')
      .select('*')
      .eq('email', cleanEmail)
      .maybeSingle();

    if (dbUser) {
      dbUserPassword = dbUser.password || '';
      if (!user) {
        user = {
          id: dbUser.id,
          name: dbUser.name,
          email: dbUser.email,
          role: ADMIN_EMAILS.includes(cleanEmail) ? 'admin' : (dbUser.role || 'user'),
          balance: Number(dbUser.balance) || 0,
          energy: dbUser.energy || 200,
          maxEnergy: dbUser.max_energy || 200,
          energyLevel: dbUser.energy_level || 1,
          hitLevel: dbUser.hit_level || 1,
          hitDamage: Number(dbUser.hit_damage) || 0.5,
          subjectLevel: dbUser.subject_level || 1,
          subjectHp: Number(dbUser.subject_hp) || 100,
          subjectMaxHp: Number(dbUser.subject_max_hp) || 100,
          referralCode: dbUser.referral_code || '',
          referredBy: dbUser.referred_by || undefined,
          deviceId: dbUser.device_id || '',
          deviceName: dbUser.device_name || '',
          lastActive: dbUser.last_active || new Date().toISOString(),
          createdAt: dbUser.created_at || new Date().toISOString(),
        };
        mockUsers.set(user.id, user);
        mockUsers.set(cleanEmail, user);
      }
    }
  } catch (err) {
    console.error('Supabase fetch login user error:', err);
  }

  if (!user) {
    return res.status(404).json({ error: 'No account found with this Gmail. Please sign up.' });
  }

  // Password verification check
  if (dbUserPassword && dbUserPassword !== password) {
    return res.status(401).json({ error: 'Incorrect password! Please check and try again.' });
  }

  user.energy = calculateRechargedEnergy(user);
  user.lastActive = new Date().toISOString();

  res.json({
    success: true,
    user,
    token: `token_${user.id}`,
  });
});

// 5. Game: Synchronize / Fetch User State
app.get('/api/game/user/:userId', async (req, res) => {
  const { userId } = req.params;
  const user = await getUserById(userId);

  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }

  user.energy = calculateRechargedEnergy(user);
  user.lastActive = new Date().toISOString();
  await saveUserToSupabase(user);

  res.json({ success: true, user });
});

// 5.5 Game: Periodic 30-Second Auto Sync User State
app.post('/api/game/sync', async (req, res) => {
  const { userId, userState } = req.body;
  if (!userId) {
    return res.status(400).json({ error: 'User ID is required' });
  }

  const user = await getUserById(userId);
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }

  if (userState) {
    if (typeof userState.balance === 'number' && !isNaN(userState.balance)) {
      user.balance = Math.max(user.balance, userState.balance);
    }
    if (typeof userState.energy === 'number' && !isNaN(userState.energy)) {
      user.energy = userState.energy;
    }
    if (typeof userState.subjectHp === 'number' && !isNaN(userState.subjectHp)) {
      user.subjectHp = userState.subjectHp;
    }
    if (typeof userState.subjectLevel === 'number' && !isNaN(userState.subjectLevel)) {
      user.subjectLevel = Math.max(user.subjectLevel, userState.subjectLevel);
    }
    if (typeof userState.subjectMaxHp === 'number' && !isNaN(userState.subjectMaxHp)) {
      user.subjectMaxHp = userState.subjectMaxHp;
    }
    if (typeof userState.energyLevel === 'number' && !isNaN(userState.energyLevel)) {
      user.energyLevel = Math.max(user.energyLevel, userState.energyLevel);
    }
    if (typeof userState.hitLevel === 'number' && !isNaN(userState.hitLevel)) {
      user.hitLevel = Math.max(user.hitLevel, userState.hitLevel);
    }
    if (typeof userState.hitDamage === 'number' && !isNaN(userState.hitDamage)) {
      user.hitDamage = userState.hitDamage;
    }
    if (typeof userState.maxEnergy === 'number' && !isNaN(userState.maxEnergy)) {
      user.maxEnergy = userState.maxEnergy;
    }
  }

  user.energy = calculateRechargedEnergy(user);
  user.lastActive = new Date().toISOString();

  // Save in memory map
  mockUsers.set(user.id, user);
  if (user.email) mockUsers.set(user.email.toLowerCase(), user);

  // Persist to Supabase Database
  await saveUserToSupabase(user);

  res.json({ success: true, message: 'Data synced successfully to database', user });
});

// 6. Game: Tap Action
app.post('/api/game/tap', async (req, res) => {
  const { userId, tapsCount = 1 } = req.body;
  const user = await getUserById(userId);

  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }

  user.energy = calculateRechargedEnergy(user);

  if (user.energy < tapsCount) {
    return res.status(400).json({
      error: 'Not enough charge/energy! Energy recharges over 6 hours or upgrade Charge Box.',
      user,
    });
  }

  // Apply Taps
  const coinsEarned = tapsCount * user.hitDamage;
  user.energy -= tapsCount;
  user.balance += coinsEarned;

  // Damage Subject HP
  let damageDone = tapsCount * user.hitDamage;
  let subjectLevelUp = false;

  user.subjectHp -= damageDone;

  if (user.subjectHp <= 0) {
    subjectLevelUp = true;
    user.subjectLevel += 1;
    user.subjectMaxHp = user.subjectLevel * 100;
    user.subjectHp = user.subjectMaxHp;
    // Level Up Bonus!
    user.balance += user.subjectLevel * 50;
  }

  user.lastActive = new Date().toISOString();

  // Save changes to database
  await saveUserToSupabase(user);

  res.json({
    success: true,
    tapsCount,
    coinsEarned,
    newBalance: user.balance,
    newEnergy: user.energy,
    newSubjectHp: user.subjectHp,
    subjectLevelUp,
    newSubjectLevel: user.subjectLevel,
    newSubjectMaxHp: user.subjectMaxHp,
    user,
  });
});

// 7. Game: Upgrades (Charge Box Level UP & Hit Damage Level UP)
app.post('/api/game/upgrade', async (req, res) => {
  const { userId, upgradeType } = req.body; // 'energy' or 'hit'
  const user = await getUserById(userId);

  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }

  if (upgradeType === 'energy') {
    const cost = user.energyLevel * 100;
    if (user.balance < cost) {
      return res.status(400).json({ error: `Insufficient $NXB balance! Needs ${cost} coins.` });
    }
    user.balance -= cost;
    user.energyLevel += 1;
    user.maxEnergy += 500;
    user.energy = user.maxEnergy; // Fully refills energy on upgrade!
  } else if (upgradeType === 'hit') {
    const cost = user.hitLevel * 150;
    if (user.balance < cost) {
      return res.status(400).json({ error: `Insufficient $NXB balance! Needs ${cost} coins.` });
    }
    user.balance -= cost;
    user.hitLevel += 1;
    user.hitDamage = user.hitLevel * 0.5;
  } else {
    return res.status(400).json({ error: 'Invalid upgrade type' });
  }

  user.lastActive = new Date().toISOString();
  await saveUserToSupabase(user);

  res.json({ success: true, user });
});

// 8. Tasks: Get all tasks
app.get('/api/tasks', (req, res) => {
  res.json({ success: true, tasks: mockTasks });
});

// 9. Tasks: Submit proof
app.post('/api/tasks/submit', async (req, res) => {
  const { taskId, userId, proofImageBase64 } = req.body;
  const user = await getUserById(userId);
  const task = mockTasks.find(t => t.id === taskId);

  if (!user || !task) {
    return res.status(400).json({ error: 'Invalid user or task ID' });
  }

  let imageUrl = '';
  if (task.requiresProof && proofImageBase64) {
    imageUrl = await uploadToImgBB(proofImageBase64);
  }

  const submission: TaskSubmission = {
    id: `sub_${Date.now()}`,
    taskId,
    userId,
    userName: user.name,
    userEmail: user.email,
    proofImageUrl: imageUrl,
    status: task.requiresProof ? 'pending' : 'approved',
    submittedAt: new Date().toISOString(),
  };

  if (!task.requiresProof) {
    // Auto approve
    user.balance += task.reward;
  }

  mockSubmissions.push(submission);
  await saveUserToSupabase(user);

  res.json({
    success: true,
    submission,
    newBalance: user.balance,
    message: task.requiresProof ? 'Proof screenshot submitted for admin review!' : 'Task completed and reward added!',
  });
});

// 10. Tasks: User Submissions
app.get('/api/tasks/my-submissions/:userId', (req, res) => {
  const { userId } = req.params;
  const userSubmissions = mockSubmissions.filter(s => s.userId === userId);
  res.json({ success: true, submissions: userSubmissions });
});

// 11. Referrals: Get User Referrals & Status
app.get('/api/referrals/my/:userId', async (req, res) => {
  const { userId } = req.params;
  const user = await getUserById(userId);

  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }

  // Perform referral verification evaluation for pending 12-hour referrals
  const now = Date.now();
  const referrals = mockReferrals.filter(r => r.referrerId === userId);

  referrals.forEach(ref => {
    if (ref.status === 'pending') {
      const referredUser = mockUsers.get(ref.referredUserId);
      if (referredUser) {
        const createdAtTime = new Date(ref.createdAt).getTime();
        const elapsedHours = (now - createdAtTime) / (3600 * 1000);

        // Verification condition checks:
        // 1. Logged in dashboard at least 1 hour in last 10 hours
        const lastActiveTime = new Date(referredUser.lastActive).getTime();
        const activeWithinLast10Hours = (now - lastActiveTime) <= (10 * 3600 * 1000);

        // 2. Completed at least 1 task AND balance > 200
        const userApprovedSubmissions = mockSubmissions.filter(s => s.userId === referredUser.id && s.status === 'approved');
        const completedTaskAndHighBalance = userApprovedSubmissions.length >= 1 && referredUser.balance >= 200;

        if (activeWithinLast10Hours || completedTaskAndHighBalance) {
          ref.status = 'verified';
          ref.verifiedAt = new Date().toISOString();
          // Credit 10 Taka (5000 Coins) for verified referral
          user.balance += 5000;
        } else if (elapsedHours >= 12) {
          // If 12 hours passed without meeting conditions, mark failed
          ref.status = 'failed';
          ref.failureReason = 'Did not meet activity requirements (10h active dashboard or task + 200 NXB balance) within 12 hours.';
        }
      }
    }
  });

  res.json({
    success: true,
    referralCode: user.referralCode,
    referrals,
    verifiedCount: referrals.filter(r => r.status === 'verified').length,
    pendingCount: referrals.filter(r => r.status === 'pending').length,
  });
});

// 12. Leaderboard
app.get('/api/leaderboard', (req, res) => {
  const allUsers = Array.from(new Set(mockUsers.values()))
    .sort((a, b) => b.balance - a.balance)
    .slice(0, 50)
    .map(u => ({
      id: u.id,
      name: u.name,
      balance: u.balance,
      subjectLevel: u.subjectLevel,
    }));

  res.json({ success: true, leaderboard: allUsers });
});

// 13. Admin: System Settings
app.get('/api/admin/settings', (req, res) => {
  res.json({ success: true, settings: systemSettings });
});

app.post('/api/admin/settings', (req, res) => {
  const { imgbbApiKey, brevoApiKey, resendApiKey, brevoDailyLimit, resendDailyLimit } = req.body;
  if (imgbbApiKey !== undefined) systemSettings.imgbbApiKey = imgbbApiKey;
  if (brevoApiKey !== undefined) systemSettings.brevoApiKey = brevoApiKey;
  if (resendApiKey !== undefined) systemSettings.resendApiKey = resendApiKey;
  if (brevoDailyLimit !== undefined) systemSettings.brevoDailyLimit = Number(brevoDailyLimit);
  if (resendDailyLimit !== undefined) systemSettings.resendDailyLimit = Number(resendDailyLimit);

  res.json({ success: true, settings: systemSettings, message: 'Settings updated successfully!' });
});

// 14. Admin: Submissions review
app.get('/api/admin/submissions', (req, res) => {
  res.json({ success: true, submissions: mockSubmissions });
});

app.post('/api/admin/submissions/review', (req, res) => {
  const { submissionId, status, rejectionReason } = req.body;
  const sub = mockSubmissions.find(s => s.id === submissionId);

  if (!sub) {
    return res.status(404).json({ error: 'Submission not found' });
  }

  sub.status = status;
  sub.reviewedAt = new Date().toISOString();
  if (rejectionReason) sub.rejectionReason = rejectionReason;

  if (status === 'approved') {
    const user = mockUsers.get(sub.userId);
    const task = mockTasks.find(t => t.id === sub.taskId);
    if (user && task) {
      // 1 Taka = 500 coins (1k coins = 2 Taka)
      const rewardCoins = Math.round(task.reward * 500);
      user.balance += rewardCoins;
    }
  }

  res.json({ success: true, submission: sub });
});

// 15. Admin: Create Task
app.post('/api/admin/tasks', (req, res) => {
  const { title, description, reward, type, category, actionUrl, requiresProof } = req.body;

  const newTask: Task = {
    id: `task_${Date.now()}`,
    title,
    description,
    reward: Number(reward) || 100,
    type: type || 'one_time',
    category: category || 'social',
    actionUrl,
    requiresProof: Boolean(requiresProof),
    createdAt: new Date().toISOString(),
  };

  mockTasks.push(newTask);
  res.json({ success: true, task: newTask });
});

// 16. Withdrawal Endpoints
app.post('/api/withdraw/request', async (req, res) => {
  const { userId, paymentMethod, accountNumber, coinsAmount } = req.body;

  if (!userId || !paymentMethod || !accountNumber || !coinsAmount) {
    return res.status(400).json({ error: 'All fields are required!' });
  }

  const user = await getUserById(userId);
  if (!user) {
    return res.status(404).json({ error: 'User not found!' });
  }

  // 1. Referral check: Must have at least 4 referrals
  const userRefs = mockReferrals.filter(r => r.referrerId === user.id);
  let totalRefs = userRefs.length;
  if (totalRefs === 0) {
    try {
      const { data: dbRefs } = await supabase
        .from('referrals')
        .select('*')
        .eq('referrer_id', user.id);
      if (dbRefs) totalRefs = dbRefs.length;
    } catch (err) {
      console.error('Supabase fetch referrals count error:', err);
    }
  }

  if (totalRefs < 4) {
    return res.status(400).json({
      error: `উইথড্র করতে সর্বনিম্ন ৪ জন রেফার লাগবে! (আপনার বর্তমান রেফার: ${totalRefs})`
    });
  }

  // 2. Minimum coins check based on date
  const targetDate = new Date('2026-08-15T00:00:00');
  const isBeforeAug15 = new Date() < targetDate;
  const minCoinsRequired = isBeforeAug15 ? 250000 : 100000;

  if (coinsAmount < minCoinsRequired) {
    const minText = isBeforeAug15 ? '২৫০k (250,000)' : '১০০k (100,000)';
    return res.status(400).json({
      error: `১৫ আগস্ট এর ${isBeforeAug15 ? 'আগে' : 'পর'} উইথড্র করতে সর্বনিম্ন ${minText} Coin লাগবে!`
    });
  }

  // 3. User balance check
  if (user.balance < coinsAmount) {
    return res.status(400).json({
      error: `আপনার অ্যাকাউন্টে পর্যাপ্ত Coin নেই! (বর্তমান ব্যালেন্স: ${user.balance.toLocaleString()} Coin)`
    });
  }

  // Deduct coins from balance
  user.balance -= coinsAmount;
  mockUsers.set(user.id, user);
  if (user.email) mockUsers.set(user.email.toLowerCase(), user);
  await saveUserToSupabase(user);

  // Rate: 1k coins = 2 Taka
  const takaAmount = Math.floor((coinsAmount / 1000) * 2);

  const withdrawalRecord: WithdrawalRecord = {
    id: `wth_${Date.now()}`,
    userId: user.id,
    userName: user.name,
    userEmail: user.email,
    paymentMethod,
    accountNumber,
    coinsAmount,
    takaAmount,
    status: 'pending',
    requestedAt: new Date().toISOString(),
  };

  mockWithdrawals.push(withdrawalRecord);

  // Persist in Supabase
  try {
    await supabase.from('withdrawals').upsert({
      id: withdrawalRecord.id,
      user_id: withdrawalRecord.userId,
      user_name: withdrawalRecord.userName,
      user_email: withdrawalRecord.userEmail,
      payment_method: withdrawalRecord.paymentMethod,
      account_number: withdrawalRecord.accountNumber,
      coins_amount: withdrawalRecord.coinsAmount,
      taka_amount: withdrawalRecord.takaAmount,
      status: withdrawalRecord.status,
      requested_at: withdrawalRecord.requestedAt,
    });
  } catch (err) {
    console.error('Supabase save withdrawal error:', err);
  }

  res.json({
    success: true,
    message: 'Withdrawal request submitted successfully to Request Panel!',
    withdrawal: withdrawalRecord,
    user,
  });
});

app.get('/api/withdraw/my/:userId', async (req, res) => {
  const { userId } = req.params;
  let list = mockWithdrawals.filter(w => w.userId === userId);

  if (list.length === 0) {
    try {
      const { data: dbWths } = await supabase
        .from('withdrawals')
        .select('*')
        .eq('user_id', userId)
        .order('requested_at', { ascending: false });

      if (dbWths) {
        list = dbWths.map(w => ({
          id: w.id,
          userId: w.user_id,
          userName: w.user_name,
          userEmail: w.user_email,
          paymentMethod: w.payment_method,
          accountNumber: w.account_number,
          coinsAmount: Number(w.coins_amount) || 0,
          takaAmount: Number(w.taka_amount) || 0,
          status: w.status,
          rejectionReason: w.rejection_reason,
          requestedAt: w.requested_at,
          processedAt: w.processed_at,
        }));
      }
    } catch (err) {
      console.error('Supabase fetch my withdrawals error:', err);
    }
  }

  res.json({ success: true, withdrawals: list });
});

app.get('/api/admin/withdrawals', async (req, res) => {
  let list = [...mockWithdrawals];

  try {
    const { data: dbWths } = await supabase
      .from('withdrawals')
      .select('*')
      .order('requested_at', { ascending: false });

    if (dbWths && dbWths.length > 0) {
      list = dbWths.map(w => ({
        id: w.id,
        userId: w.user_id,
        userName: w.user_name,
        userEmail: w.user_email,
        paymentMethod: w.payment_method,
        accountNumber: w.account_number,
        coinsAmount: Number(w.coins_amount) || 0,
        takaAmount: Number(w.taka_amount) || 0,
        status: w.status,
        rejectionReason: w.rejection_reason,
        requestedAt: w.requested_at,
        processedAt: w.processed_at,
      }));
    }
  } catch (err) {
    console.error('Supabase fetch admin withdrawals error:', err);
  }

  res.json({ success: true, withdrawals: list });
});

app.post('/api/admin/withdrawals/review', async (req, res) => {
  const { withdrawalId, status, rejectionReason } = req.body;

  const wRecord = mockWithdrawals.find(w => w.id === withdrawalId);
  if (wRecord) {
    wRecord.status = status;
    wRecord.processedAt = new Date().toISOString();
    wRecord.rejectionReason = rejectionReason;

    // Refund if rejected
    if (status === 'rejected') {
      const user = await getUserById(wRecord.userId);
      if (user) {
        user.balance += wRecord.coinsAmount;
        await saveUserToSupabase(user);
      }
    }
  }

  try {
    await supabase.from('withdrawals').update({
      status,
      rejection_reason: rejectionReason || null,
      processed_at: new Date().toISOString(),
    }).eq('id', withdrawalId);

    if (status === 'rejected' && wRecord) {
      const user = await getUserById(wRecord.userId);
      if (user) {
        await supabase.from('users').update({ balance: user.balance }).eq('id', user.id);
      }
    }
  } catch (err) {
    console.error('Supabase review withdrawal error:', err);
  }

  res.json({ success: true, message: `Withdrawal request ${status}` });
});

// Serve Vite frontend
async function startServer() {
  if (process.env.NODE_ENV !== 'production' && !process.env.VERCEL) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else if (!process.env.VERCEL) {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  if (!process.env.VERCEL) {
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`XN Reward Server running on http://0.0.0.0:${PORT}`);
    });
  }
}

if (!process.env.VERCEL) {
  startServer();
}

export default app;
