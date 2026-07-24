import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { SystemSettings, User, Task, TaskSubmission, ReferralRecord } from './src/types';

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

// Helper: Seed Default Admin User
const adminUser: User = {
  id: 'usr_admin',
  name: 'NXB Admin',
  email: 'admin@gmail.com',
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
  mockOtps.set(cleanEmail, { code: otpCode, expiresAt: Date.now() + 10 * 60 * 1000 });

  const emailResult = await sendOtpEmail(cleanEmail, otpCode);
  res.json({
    success: true,
    message: emailResult.message,
    provider: emailResult.providerUsed,
    previewOtp: otpCode, // Provided for instant smooth testing in UI
  });
});

// 3. Auth: Register
app.post('/api/auth/register', async (req, res) => {
  const { name, email, password, otp, referralCode, deviceId, deviceName } = req.body;

  if (!email || !email.toLowerCase().endsWith('@gmail.com')) {
    return res.status(400).json({ error: 'Only Gmail (@gmail.com) addresses are allowed!' });
  }

  const cleanEmail = email.toLowerCase().trim();

  // Validate OTP
  const otpEntry = mockOtps.get(cleanEmail);
  if (!otpEntry || otpEntry.code !== otp || Date.now() > otpEntry.expiresAt) {
    return res.status(400).json({ error: 'Invalid or expired OTP code!' });
  }

  // Check existing user
  if (mockUsers.has(cleanEmail)) {
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
    name: name || 'NXB Hunter',
    email: cleanEmail,
    role: 'user',
    balance: 50, // Welcome signup bonus
    energy: 1000,
    maxEnergy: 1000,
    energyLevel: 1,
    hitLevel: 1,
    hitDamage: 0.5,
    subjectLevel: 1,
    subjectHp: 100,
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
        // Immediate 100 NXB reward for 1st referral
        referrer.balance += 100;
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
app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  if (!email) {
    return res.status(400).json({ error: 'Email is required' });
  }

  const cleanEmail = email.toLowerCase().trim();
  const user = mockUsers.get(cleanEmail);

  if (!user) {
    return res.status(404).json({ error: 'No account found with this Gmail. Please sign up.' });
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
app.get('/api/game/user/:userId', (req, res) => {
  const { userId } = req.params;
  const user = mockUsers.get(userId);
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }

  user.energy = calculateRechargedEnergy(user);
  user.lastActive = new Date().toISOString();

  res.json({ success: true, user });
});

// 6. Game: Tap Action
app.post('/api/game/tap', (req, res) => {
  const { userId, tapsCount = 1 } = req.body;
  const user = mockUsers.get(userId);

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
app.post('/api/game/upgrade', (req, res) => {
  const { userId, upgradeType } = req.body; // 'energy' or 'hit'
  const user = mockUsers.get(userId);

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
  res.json({ success: true, user });
});

// 8. Tasks: Get all tasks
app.get('/api/tasks', (req, res) => {
  res.json({ success: true, tasks: mockTasks });
});

// 9. Tasks: Submit proof
app.post('/api/tasks/submit', async (req, res) => {
  const { taskId, userId, proofImageBase64 } = req.body;
  const user = mockUsers.get(userId);
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
app.get('/api/referrals/my/:userId', (req, res) => {
  const { userId } = req.params;
  const user = mockUsers.get(userId);

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
          // Credit 150 NXB for verified subsequent referral
          user.balance += 150;
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
      user.balance += task.reward;
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

// Serve Vite frontend
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
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
