import { User, Task, TaskSubmission, ReferralRecord, SystemSettings, TapResponse } from '../types';

// Extract Device Fingerprint Info
export function getDeviceInfo(): { deviceId: string; deviceName: string } {
  let deviceId = localStorage.getItem('nxb_device_id');
  if (!deviceId) {
    deviceId = 'dev_' + Math.random().toString(36).substring(2, 11) + '_' + Date.now().toString(36);
    localStorage.setItem('nxb_device_id', deviceId);
  }

  const ua = navigator.userAgent;
  let deviceName = 'Browser Device';

  if (/android/i.test(ua)) {
    deviceName = 'Android Device';
  } else if (/iPhone|iPad|iPod/i.test(ua)) {
    deviceName = 'Apple iOS Device';
  } else if (/Macintosh/i.test(ua)) {
    deviceName = 'Mac Workstation';
  } else if (/Windows/i.test(ua)) {
    deviceName = 'Windows PC';
  } else if (/Linux/i.test(ua)) {
    deviceName = 'Linux Workstation';
  }

  return { deviceId, deviceName };
}

export async function sendOtpApi(email: string) {
  const res = await fetch('/api/auth/send-otp', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email }),
  });
  return res.json();
}

export async function registerApi(data: {
  name: string;
  email: string;
  password?: string;
  otp: string;
  referralCode?: string;
}) {
  const { deviceId, deviceName } = getDeviceInfo();
  const res = await fetch('/api/auth/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ...data, deviceId, deviceName }),
  });
  return res.json();
}

export async function loginApi(email: string) {
  const res = await fetch('/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email }),
  });
  return res.json();
}

export async function fetchUserApi(userId: string) {
  const res = await fetch(`/api/game/user/${userId}`);
  return res.json();
}

export async function tapApi(userId: string, tapsCount: number = 1): Promise<{ success: boolean; user?: User; coinsEarned?: number; subjectLevelUp?: boolean; error?: string }> {
  const res = await fetch('/api/game/tap', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId, tapsCount }),
  });
  return res.json();
}

export async function upgradeApi(userId: string, upgradeType: 'energy' | 'hit') {
  const res = await fetch('/api/game/upgrade', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId, upgradeType }),
  });
  return res.json();
}

export async function fetchTasksApi() {
  const res = await fetch('/api/tasks');
  return res.json();
}

export async function submitTaskProofApi(taskId: string, userId: string, proofImageBase64?: string) {
  const res = await fetch('/api/tasks/submit', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ taskId, userId, proofImageBase64 }),
  });
  return res.json();
}

export async function fetchMySubmissionsApi(userId: string) {
  const res = await fetch(`/api/tasks/my-submissions/${userId}`);
  return res.json();
}

export async function fetchReferralsApi(userId: string) {
  const res = await fetch(`/api/referrals/my/${userId}`);
  return res.json();
}

export async function fetchLeaderboardApi() {
  const res = await fetch('/api/leaderboard');
  return res.json();
}

// Admin APIs
export async function fetchAdminSettingsApi() {
  const res = await fetch('/api/admin/settings');
  return res.json();
}

export async function updateAdminSettingsApi(settings: Partial<SystemSettings>) {
  const res = await fetch('/api/admin/settings', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(settings),
  });
  return res.json();
}

export async function fetchAdminSubmissionsApi() {
  const res = await fetch('/api/admin/submissions');
  return res.json();
}

export async function reviewSubmissionApi(submissionId: string, status: 'approved' | 'rejected', rejectionReason?: string) {
  const res = await fetch('/api/admin/submissions/review', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ submissionId, status, rejectionReason }),
  });
  return res.json();
}

export async function createAdminTaskApi(taskData: any) {
  const res = await fetch('/api/admin/tasks', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(taskData),
  });
  return res.json();
}
